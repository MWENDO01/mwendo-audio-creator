import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

const FAQ = () => {
  const faqs = [
    {
      question: "What is MWENDO?",
      answer: "MWENDO is an AI-powered text-to-speech platform that transforms your books, documents, and text into professional audio. We use advanced AI voices to create natural-sounding audio from any written content."
    },
    {
      question: "What file formats do you support?",
      answer: "We currently support PDF files and plain text input. You can upload PDF documents directly or paste text into our converter. We're working on adding support for more formats like EPUB, DOCX, and TXT files."
    },
    {
      question: "How many voices are available?",
      answer: "We offer a variety of AI-generated voices in different languages, accents, and styles. Our voice library includes male and female voices, with options ranging from professional narration to casual conversational tones."
    },
    {
      question: "What's the maximum file size I can upload?",
      answer: "Free users can upload PDFs up to 5MB. Premium subscribers can upload files up to 50MB, and Enterprise users have no file size limits. Large documents are processed in chunks to ensure quality output."
    },
    {
      question: "How long does conversion take?",
      answer: "Conversion time depends on the length of your content. Most documents are converted within minutes. A typical 100-page book takes approximately 5-10 minutes to process. You'll receive a notification when your audio is ready."
    },
    {
      question: "Can I download the audio files?",
      answer: "Yes! All converted audio files can be downloaded in MP3 format. Premium users also have access to WAV and other high-quality formats. Your files are stored in your dashboard for easy access anytime."
    },
    {
      question: "Is there a free trial?",
      answer: "Yes, we offer a free tier that includes up to 10,000 characters per month. This is perfect for trying out the service and converting short documents. Upgrade to a paid plan for higher limits and additional features."
    },
    {
      question: "What languages do you support?",
      answer: "We support multiple languages including English (various accents), Spanish, French, German, Italian, Portuguese, Japanese, Korean, Chinese, and more. New languages are added regularly based on user demand."
    },
    {
      question: "How do I manage my subscription?",
      answer: "You can manage your subscription from your dashboard. Go to Settings > Subscription to view your current plan, upgrade, downgrade, or cancel. Changes take effect at the start of your next billing cycle."
    },
    {
      question: "Is my content secure?",
      answer: "Absolutely. We take privacy seriously. All uploads are encrypted in transit and at rest. We don't share your content with third parties, and you can delete your files at any time. See our Privacy Policy for full details."
    },
    {
      question: "Can I use the audio commercially?",
      answer: "Yes, with our Premium and Enterprise plans. The audio you generate can be used for commercial purposes including podcasts, audiobooks, video content, and e-learning materials. Free tier is for personal use only."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept PayPal for all subscription payments. Simply select your preferred plan and complete the payment through PayPal's secure checkout. You can use your PayPal balance, linked bank account, or credit/debit card."
    },
    {
      question: "How do I contact support?",
      answer: "You can reach our support team at support@mwendo.co. We typically respond within 24 hours on business days. Premium and Enterprise customers have access to priority support with faster response times."
    },
    {
      question: "Can I cancel my subscription anytime?",
      answer: "Yes, you can cancel your subscription at any time from your dashboard. You'll continue to have access to premium features until the end of your current billing period. No questions asked, no hidden fees."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent mb-6">
              <HelpCircle className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Find answers to common questions about MWENDO's text-to-speech service.
            </p>
          </div>

          {/* FAQ Accordion */}
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="bg-card border border-border rounded-xl px-6 data-[state=open]:ring-2 data-[state=open]:ring-primary/20"
              >
                <AccordionTrigger className="text-left hover:no-underline py-5">
                  <span className="font-medium text-lg">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {/* Contact CTA */}
          <div className="mt-12 text-center p-8 bg-card border border-border rounded-2xl">
            <h3 className="text-xl font-semibold mb-2">Still have questions?</h3>
            <p className="text-muted-foreground mb-4">
              Can't find what you're looking for? Our support team is here to help.
            </p>
            <a 
              href="mailto:support@mwendo.co" 
              className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
            >
              Contact Support →
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FAQ;
