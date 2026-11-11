REVOKE ALL ON TABLE
    public.admin_settings,
    public.support_tickets,
    public.backend_search_events
FROM anon, authenticated;

REVOKE ALL ON SEQUENCE public.backend_search_events_id_seq
FROM anon, authenticated;
