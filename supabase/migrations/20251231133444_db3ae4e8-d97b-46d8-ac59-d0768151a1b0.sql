-- Create audio_conversions table for storing user conversion history
CREATE TABLE public.audio_conversions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  original_filename TEXT,
  duration_seconds INTEGER,
  file_size_bytes BIGINT,
  audio_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  character_count INTEGER DEFAULT 0,
  voice_id TEXT,
  voice_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.audio_conversions ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own conversions" 
ON public.audio_conversions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own conversions" 
ON public.audio_conversions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversions" 
ON public.audio_conversions 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversions" 
ON public.audio_conversions 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update timestamps (if not exists)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_audio_conversions_updated_at
BEFORE UPDATE ON public.audio_conversions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster user queries
CREATE INDEX idx_audio_conversions_user_id ON public.audio_conversions(user_id);
CREATE INDEX idx_audio_conversions_created_at ON public.audio_conversions(created_at DESC);