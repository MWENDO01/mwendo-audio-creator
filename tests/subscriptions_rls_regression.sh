#!/bin/bash
set -u
PASS=0; FAIL=0
check() { if echo "$3" | grep -qiE "$2"; then echo "PASS: $1"; PASS=$((PASS+1)); else echo "FAIL: $1 -- got: $3"; FAIL=$((FAIL+1)); fi; }

USR="00000000-0000-0000-0000-00000000aaaa"
OTHER="00000000-0000-0000-0000-00000000bbbb"

psql -q -c "delete from public.subscriptions where user_id in ('$USR','$OTHER');" >/dev/null
psql -q -c "insert into public.subscriptions (user_id, plan, status, paystack_email, paystack_customer_code, current_period_end) values ('$USR','pro','active','orig@example.com','CUS_orig', now()+interval '30 days');" >/dev/null

CLAIM_U="{\"sub\":\"$USR\",\"role\":\"authenticated\"}"
CLAIM_O="{\"sub\":\"$OTHER\",\"role\":\"authenticated\"}"
run_as_user() {
  local claim=$1; shift
  psql -v ON_ERROR_STOP=0 <<SQL 2>&1
begin;
select set_config('request.jwt.claims','$claim',true);
set local role authenticated;
$*
rollback;
SQL
}

check "block paystack_email change" "not allowed|violates row-level" "$(run_as_user "$CLAIM_U" "update public.subscriptions set paystack_email='evil@x.com' where user_id='$USR';")"
check "block plan change"           "not allowed|violates row-level" "$(run_as_user "$CLAIM_U" "update public.subscriptions set plan='enterprise' where user_id='$USR';")"
check "block status change"         "not allowed|violates row-level" "$(run_as_user "$CLAIM_U" "update public.subscriptions set status='cancelled' where user_id='$USR';")"
check "block customer_code change"  "not allowed|violates row-level" "$(run_as_user "$CLAIM_U" "update public.subscriptions set paystack_customer_code='CUS_evil' where user_id='$USR';")"
check "block period_end change"     "not allowed|violates row-level" "$(run_as_user "$CLAIM_U" "update public.subscriptions set current_period_end=now()+interval '10 years' where user_id='$USR';")"
check "block subscription_code change" "not allowed|violates row-level" "$(run_as_user "$CLAIM_U" "update public.subscriptions set paystack_subscription_code='SUB_evil' where user_id='$USR';")"
check "cross-user update matches 0" "UPDATE 0"                       "$(run_as_user "$CLAIM_O" "update public.subscriptions set paystack_email='x@y.com' where user_id='$USR';")"

# service_role must be able to update
SVC=$(psql -v ON_ERROR_STOP=0 <<SQL 2>&1
begin;
select set_config('request.jwt.claims','{"role":"service_role"}',true);
set local role service_role;
update public.subscriptions set paystack_email='svc@example.com', plan='enterprise' where user_id='$USR';
rollback;
SQL
)
check "service_role can update billing fields" "UPDATE 1" "$SVC"

# Verify row unchanged after all attempts
FINAL=$(psql -tAX -F'|' -c "select plan, status, paystack_email, paystack_customer_code from public.subscriptions where user_id='$USR';")
check "row remains immutable" "^pro\|active\|orig@example.com\|CUS_orig$" "$FINAL"

psql -q -c "delete from public.subscriptions where user_id in ('$USR','$OTHER');" >/dev/null

echo ""; echo "==== $PASS passed, $FAIL failed ===="
exit $FAIL
