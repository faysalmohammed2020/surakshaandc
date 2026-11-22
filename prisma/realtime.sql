-- Transactional notifications contain identifiers only, never message/contact data.
CREATE OR REPLACE FUNCTION suraksha_realtime_notify() RETURNS trigger AS $$
DECLARE
  row_data jsonb;
  payload jsonb;
BEGIN
  IF TG_OP = 'DELETE' THEN row_data := to_jsonb(OLD); ELSE row_data := to_jsonb(NEW); END IF;
  IF TG_TABLE_NAME = 'enquiries' THEN
    payload := jsonb_build_object('scope', 'enquiries');
  ELSIF TG_TABLE_NAME = 'analytics_events' THEN
    -- Very frequent (visitor heartbeats); the Node server throttles these before fan-out.
    payload := jsonb_build_object('scope', 'analytics');
  ELSIF TG_TABLE_NAME = 'Blog' THEN
    payload := jsonb_build_object('scope', 'blogs');
  ELSIF TG_TABLE_NAME = 'admin_inbox_seen' THEN
    payload := jsonb_build_object('scope', 'counts', 'userId', row_data->>'user_id');
  ELSE
    -- Presence heartbeats and token rotation must not generate chat update loops.
    IF TG_TABLE_NAME = 'chat_conversations' AND TG_OP = 'UPDATE' THEN
      IF NEW.last_message_at IS NOT DISTINCT FROM OLD.last_message_at
        AND NEW.status IS NOT DISTINCT FROM OLD.status THEN RETURN NULL; END IF;
    END IF;
    payload := jsonb_build_object('scope', 'chat', 'conversationId',
      CASE WHEN TG_TABLE_NAME = 'chat_conversations' THEN row_data->>'id' ELSE row_data->>'conversation_id' END);
  END IF;
  PERFORM pg_notify('suraksha_realtime', payload::text);
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE table_name text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY['enquiries', 'admin_inbox_seen', 'chat_conversations', 'chat_messages', 'chat_typing', 'Blog'] LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS suraksha_realtime ON %I', table_name);
    EXECUTE format('CREATE TRIGGER suraksha_realtime AFTER INSERT OR UPDATE OR DELETE ON %I FOR EACH ROW EXECUTE FUNCTION suraksha_realtime_notify()', table_name);
  END LOOP;
  -- Analytics only needs new rows; one notification per statement keeps batch inserts cheap.
  DROP TRIGGER IF EXISTS suraksha_realtime ON "analytics_events";
  CREATE TRIGGER suraksha_realtime AFTER INSERT ON "analytics_events" FOR EACH STATEMENT EXECUTE FUNCTION suraksha_realtime_notify();
END;
$$;
