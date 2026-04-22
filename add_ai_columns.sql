ALTER TABLE properties_config ADD COLUMN IF NOT EXISTS gemini_api_key text;
ALTER TABLE properties_config ADD COLUMN IF NOT EXISTS ai_context text;
