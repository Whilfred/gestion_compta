ad_spends|1|id|integer|NO|nextval('ad_spends_id_seq'::regclass)
ad_spends|2|user_id|uuid|NO|
ad_spends|3|amount_xof|integer|NO|
ad_spends|4|platform|character varying(50)|YES|
ad_spends|5|note|character varying(500)|YES|
ad_spends|6|spent_on|date|NO|CURRENT_DATE
ad_spends|7|created_at|timestamp with time zone|NO|now()
ad_spends|8|leads|integer|NO|0
calls|1|id|integer|NO|nextval('calls_id_seq'::regclass)
calls|2|user_id|uuid|NO|
calls|3|scheduled_at|timestamp with time zone|NO|
calls|4|duration_minutes|integer|NO|30
calls|5|topic|character varying(200)|YES|
calls|6|meeting_url|text|YES|
calls|7|status|character varying(20)|NO|'prevu'::character varying
calls|8|notes|text|YES|
calls|9|created_at|timestamp with time zone|NO|now()
contact_messages|1|id|integer|NO|nextval('contact_messages_id_seq'::regclass)
contact_messages|2|name|character varying(120)|NO|
contact_messages|3|email|character varying(255)|NO|
contact_messages|4|subject|character varying(200)|YES|
contact_messages|5|message|text|NO|
contact_messages|6|is_read|boolean|NO|false
contact_messages|7|created_at|timestamp with time zone|NO|now()
enrollments|1|id|uuid|NO|gen_random_uuid()
enrollments|2|user_id|uuid|NO|
enrollments|3|formation_id|integer|NO|
enrollments|4|plan_id|integer|YES|
enrollments|5|status|character varying(20)|NO|'active'::character varying
enrollments|6|enrolled_at|timestamp with time zone|NO|now()
enrollments|7|completed_at|timestamp with time zone|YES|
formations|1|id|integer|NO|nextval('formations_id_seq'::regclass)
formations|2|slug|character varying(100)|NO|
formations|3|title|character varying(200)|NO|
formations|4|subtitle|text|YES|
formations|5|description|text|YES|
formations|6|cover_image|text|YES|
formations|7|cover_video|text|YES|
formations|8|price_xof|integer|NO|0
formations|9|level|character varying(20)|YES|'debutant'::character varying
formations|10|position|integer|NO|0
formations|11|is_published|boolean|NO|false
formations|12|created_at|timestamp with time zone|NO|now()
formations|13|updated_at|timestamp with time zone|NO|now()
lesson_progress|1|user_id|uuid|NO|
lesson_progress|2|lesson_id|integer|NO|
lesson_progress|3|completed|boolean|NO|false
lesson_progress|4|completed_at|timestamp with time zone|YES|
lessons|1|id|integer|NO|nextval('lessons_id_seq'::regclass)
lessons|2|module_id|integer|NO|
lessons|3|title|character varying(200)|NO|
lessons|4|content|text|YES|
lessons|5|video_url|text|YES|
lessons|6|duration_minutes|integer|YES|
lessons|7|position|integer|NO|0
lessons|8|is_free_preview|boolean|NO|false
modules|1|id|integer|NO|nextval('modules_id_seq'::regclass)
modules|2|formation_id|integer|NO|
modules|3|title|character varying(200)|NO|
modules|4|position|integer|NO|0
path_formations|1|path_id|integer|NO|
path_formations|2|formation_id|integer|NO|
path_formations|3|position|integer|NO|0
paths|1|id|integer|NO|nextval('paths_id_seq'::regclass)
paths|2|slug|character varying(100)|NO|
paths|3|title|character varying(200)|NO|
paths|4|description|text|YES|
paths|5|position|integer|NO|0
payments|1|id|uuid|NO|gen_random_uuid()
payments|2|user_id|uuid|NO|
payments|3|formation_id|integer|YES|
payments|4|plan_id|integer|YES|
payments|5|amount_xof|integer|NO|
payments|6|method|character varying(30)|YES|
payments|7|provider_ref|character varying(120)|YES|
payments|8|status|character varying(20)|NO|'pending'::character varying
payments|9|created_at|timestamp with time zone|NO|now()
payments|10|paid_at|timestamp with time zone|YES|
plans|1|id|integer|NO|nextval('plans_id_seq'::regclass)
plans|2|slug|character varying(50)|NO|
plans|3|name|character varying(100)|NO|
plans|4|price_xof|integer|NO|
plans|5|duration_days|integer|YES|
plans|6|features|jsonb|NO|'[]'::jsonb
plans|7|is_active|boolean|NO|true
plans|8|position|integer|NO|0
sessions|1|id|uuid|NO|gen_random_uuid()
sessions|2|user_id|uuid|NO|
sessions|3|token_hash|text|NO|
sessions|4|expires_at|timestamp with time zone|NO|
sessions|5|created_at|timestamp with time zone|NO|now()
student_expenses|1|id|integer|NO|nextval('student_expenses_id_seq'::regclass)
student_expenses|2|user_id|uuid|NO|
student_expenses|3|amount_xof|integer|NO|
student_expenses|4|label|character varying(100)|YES|
student_expenses|5|note|character varying(500)|YES|
student_expenses|6|spent_on|date|NO|CURRENT_DATE
student_expenses|7|created_at|timestamp with time zone|NO|now()
student_profiles|1|user_id|uuid|NO|
student_profiles|2|niche|character varying(120)|YES|
student_profiles|3|product|character varying(200)|YES|
student_profiles|4|goal_xof|integer|NO|0
student_profiles|5|status|character varying(20)|NO|'actif'::character varying
student_profiles|6|notes|text|YES|
student_profiles|7|updated_at|timestamp with time zone|NO|now()
student_profiles|8|price_xof|integer|NO|0
student_profiles|9|channel|character varying(60)|YES|
student_profiles|10|sales_url|text|YES|
student_revenues|1|id|integer|NO|nextval('student_revenues_id_seq'::regclass)
student_revenues|2|user_id|uuid|NO|
student_revenues|3|amount_xof|integer|NO|
student_revenues|4|source|character varying(100)|YES|
student_revenues|5|note|character varying(500)|YES|
student_revenues|6|earned_on|date|NO|CURRENT_DATE
student_revenues|7|created_at|timestamp with time zone|NO|now()
student_revenues|8|units|integer|NO|0
users|1|id|uuid|NO|gen_random_uuid()
users|2|full_name|character varying(120)|NO|
users|3|email|character varying(255)|NO|
users|4|phone|character varying(30)|YES|
users|5|password_hash|text|NO|
users|6|role|character varying(20)|NO|'student'::character varying
users|7|avatar_url|text|YES|
users|8|is_active|boolean|NO|true
users|9|created_at|timestamp with time zone|NO|now()
users|10|updated_at|timestamp with time zone|NO|now()
users|users_created_at_not_null|NOT NULL created_at
users|users_email_key|UNIQUE (email)
users|users_email_not_null|NOT NULL email
users|users_full_name_not_null|NOT NULL full_name
users|users_id_not_null|NOT NULL id
users|users_is_active_not_null|NOT NULL is_active
users|users_password_hash_not_null|NOT NULL password_hash
users|users_pkey|PRIMARY KEY (id)
users|users_role_check|CHECK (((role)::text = ANY ((ARRAY['student'::character varying, 'admin'::character varying])::text[])))
users|users_role_not_null|NOT NULL role
users|users_updated_at_not_null|NOT NULL updated_at
sessions|sessions_created_at_not_null|NOT NULL created_at
sessions|sessions_expires_at_not_null|NOT NULL expires_at
sessions|sessions_id_not_null|NOT NULL id
sessions|sessions_pkey|PRIMARY KEY (id)
sessions|sessions_token_hash_key|UNIQUE (token_hash)
sessions|sessions_token_hash_not_null|NOT NULL token_hash
sessions|sessions_user_id_fkey|FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
sessions|sessions_user_id_not_null|NOT NULL user_id
formations|formations_created_at_not_null|NOT NULL created_at
formations|formations_id_not_null|NOT NULL id
formations|formations_is_published_not_null|NOT NULL is_published
formations|formations_level_check|CHECK (((level)::text = ANY ((ARRAY['debutant'::character varying, 'intermediaire'::character varying, 'avance'::character varying])::text[])))
formations|formations_pkey|PRIMARY KEY (id)
formations|formations_position_not_null|NOT NULL "position"
formations|formations_price_xof_not_null|NOT NULL price_xof
formations|formations_slug_key|UNIQUE (slug)
formations|formations_slug_not_null|NOT NULL slug
formations|formations_title_not_null|NOT NULL title
formations|formations_updated_at_not_null|NOT NULL updated_at
modules|modules_formation_id_fkey|FOREIGN KEY (formation_id) REFERENCES formations(id) ON DELETE CASCADE
modules|modules_formation_id_not_null|NOT NULL formation_id
modules|modules_id_not_null|NOT NULL id
modules|modules_pkey|PRIMARY KEY (id)
modules|modules_position_not_null|NOT NULL "position"
modules|modules_title_not_null|NOT NULL title
lessons|lessons_id_not_null|NOT NULL id
lessons|lessons_is_free_preview_not_null|NOT NULL is_free_preview
lessons|lessons_module_id_fkey|FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE
lessons|lessons_module_id_not_null|NOT NULL module_id
lessons|lessons_pkey|PRIMARY KEY (id)
lessons|lessons_position_not_null|NOT NULL "position"
lessons|lessons_title_not_null|NOT NULL title
paths|paths_id_not_null|NOT NULL id
paths|paths_pkey|PRIMARY KEY (id)
paths|paths_position_not_null|NOT NULL "position"
paths|paths_slug_key|UNIQUE (slug)
paths|paths_slug_not_null|NOT NULL slug
paths|paths_title_not_null|NOT NULL title
path_formations|path_formations_formation_id_fkey|FOREIGN KEY (formation_id) REFERENCES formations(id) ON DELETE CASCADE
path_formations|path_formations_formation_id_not_null|NOT NULL formation_id
path_formations|path_formations_path_id_fkey|FOREIGN KEY (path_id) REFERENCES paths(id) ON DELETE CASCADE
path_formations|path_formations_path_id_not_null|NOT NULL path_id
path_formations|path_formations_pkey|PRIMARY KEY (path_id, formation_id)
path_formations|path_formations_position_not_null|NOT NULL "position"
plans|plans_features_not_null|NOT NULL features
plans|plans_id_not_null|NOT NULL id
plans|plans_is_active_not_null|NOT NULL is_active
plans|plans_name_not_null|NOT NULL name
plans|plans_pkey|PRIMARY KEY (id)
plans|plans_position_not_null|NOT NULL "position"
plans|plans_price_xof_not_null|NOT NULL price_xof
plans|plans_slug_key|UNIQUE (slug)
plans|plans_slug_not_null|NOT NULL slug
enrollments|enrollments_enrolled_at_not_null|NOT NULL enrolled_at
enrollments|enrollments_formation_id_fkey|FOREIGN KEY (formation_id) REFERENCES formations(id) ON DELETE CASCADE
enrollments|enrollments_formation_id_not_null|NOT NULL formation_id
enrollments|enrollments_id_not_null|NOT NULL id
enrollments|enrollments_pkey|PRIMARY KEY (id)
enrollments|enrollments_plan_id_fkey|FOREIGN KEY (plan_id) REFERENCES plans(id)
enrollments|enrollments_status_check|CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'completed'::character varying, 'cancelled'::character varying])::text[])))
enrollments|enrollments_status_not_null|NOT NULL status
enrollments|enrollments_user_id_fkey|FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
enrollments|enrollments_user_id_formation_id_key|UNIQUE (user_id, formation_id)
enrollments|enrollments_user_id_not_null|NOT NULL user_id
lesson_progress|lesson_progress_completed_not_null|NOT NULL completed
lesson_progress|lesson_progress_lesson_id_fkey|FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
lesson_progress|lesson_progress_lesson_id_not_null|NOT NULL lesson_id
lesson_progress|lesson_progress_pkey|PRIMARY KEY (user_id, lesson_id)
lesson_progress|lesson_progress_user_id_fkey|FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
lesson_progress|lesson_progress_user_id_not_null|NOT NULL user_id
payments|payments_amount_xof_not_null|NOT NULL amount_xof
payments|payments_created_at_not_null|NOT NULL created_at
payments|payments_formation_id_fkey|FOREIGN KEY (formation_id) REFERENCES formations(id) ON DELETE SET NULL
payments|payments_id_not_null|NOT NULL id
payments|payments_pkey|PRIMARY KEY (id)
payments|payments_plan_id_fkey|FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE SET NULL
payments|payments_status_check|CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'paid'::character varying, 'failed'::character varying, 'refunded'::character varying])::text[])))
payments|payments_status_not_null|NOT NULL status
payments|payments_user_id_fkey|FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
payments|payments_user_id_not_null|NOT NULL user_id
contact_messages|contact_messages_created_at_not_null|NOT NULL created_at
contact_messages|contact_messages_email_not_null|NOT NULL email
contact_messages|contact_messages_id_not_null|NOT NULL id
contact_messages|contact_messages_is_read_not_null|NOT NULL is_read
contact_messages|contact_messages_message_not_null|NOT NULL message
contact_messages|contact_messages_name_not_null|NOT NULL name
contact_messages|contact_messages_pkey|PRIMARY KEY (id)
student_profiles|student_profiles_goal_xof_not_null|NOT NULL goal_xof
student_profiles|student_profiles_pkey|PRIMARY KEY (user_id)
student_profiles|student_profiles_price_xof_not_null|NOT NULL price_xof
student_profiles|student_profiles_status_check|CHECK (((status)::text = ANY ((ARRAY['actif'::character varying, 'pause'::character varying, 'termine'::character varying, 'abandon'::character varying])::text[])))
student_profiles|student_profiles_status_not_null|NOT NULL status
student_profiles|student_profiles_updated_at_not_null|NOT NULL updated_at
student_profiles|student_profiles_user_id_fkey|FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
student_profiles|student_profiles_user_id_not_null|NOT NULL user_id
student_revenues|student_revenues_amount_xof_check|CHECK ((amount_xof > 0))
student_revenues|student_revenues_amount_xof_not_null|NOT NULL amount_xof
student_revenues|student_revenues_created_at_not_null|NOT NULL created_at
student_revenues|student_revenues_earned_on_not_null|NOT NULL earned_on
student_revenues|student_revenues_id_not_null|NOT NULL id
student_revenues|student_revenues_pkey|PRIMARY KEY (id)
student_revenues|student_revenues_units_check|CHECK ((units >= 0))
student_revenues|student_revenues_units_not_null|NOT NULL units
student_revenues|student_revenues_user_id_fkey|FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
student_revenues|student_revenues_user_id_not_null|NOT NULL user_id
ad_spends|ad_spends_amount_xof_check|CHECK ((amount_xof > 0))
ad_spends|ad_spends_amount_xof_not_null|NOT NULL amount_xof
ad_spends|ad_spends_created_at_not_null|NOT NULL created_at
ad_spends|ad_spends_id_not_null|NOT NULL id
ad_spends|ad_spends_leads_check|CHECK ((leads >= 0))
ad_spends|ad_spends_leads_not_null|NOT NULL leads
ad_spends|ad_spends_pkey|PRIMARY KEY (id)
ad_spends|ad_spends_spent_on_not_null|NOT NULL spent_on
ad_spends|ad_spends_user_id_fkey|FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
ad_spends|ad_spends_user_id_not_null|NOT NULL user_id
calls|calls_created_at_not_null|NOT NULL created_at
calls|calls_duration_minutes_not_null|NOT NULL duration_minutes
calls|calls_id_not_null|NOT NULL id
calls|calls_pkey|PRIMARY KEY (id)
calls|calls_scheduled_at_not_null|NOT NULL scheduled_at
calls|calls_status_check|CHECK (((status)::text = ANY ((ARRAY['prevu'::character varying, 'fait'::character varying, 'annule'::character varying, 'absent'::character varying])::text[])))
calls|calls_status_not_null|NOT NULL status
calls|calls_user_id_fkey|FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
calls|calls_user_id_not_null|NOT NULL user_id
student_expenses|student_expenses_amount_xof_check|CHECK ((amount_xof > 0))
student_expenses|student_expenses_amount_xof_not_null|NOT NULL amount_xof
student_expenses|student_expenses_created_at_not_null|NOT NULL created_at
student_expenses|student_expenses_id_not_null|NOT NULL id
student_expenses|student_expenses_pkey|PRIMARY KEY (id)
student_expenses|student_expenses_spent_on_not_null|NOT NULL spent_on
student_expenses|student_expenses_user_id_fkey|FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
student_expenses|student_expenses_user_id_not_null|NOT NULL user_id
users|users_created_at_not_null|NOT NULL created_at
users|users_email_key|UNIQUE (email)
users|users_email_not_null|NOT NULL email
users|users_full_name_not_null|NOT NULL full_name
users|users_id_not_null|NOT NULL id
users|users_is_active_not_null|NOT NULL is_active
users|users_password_hash_not_null|NOT NULL password_hash
users|users_pkey|PRIMARY KEY (id)
users|users_role_check|CHECK (((role)::text = ANY ((ARRAY['student'::character varying, 'admin'::character varying])::text[])))
users|users_role_not_null|NOT NULL role
users|users_updated_at_not_null|NOT NULL updated_at
sessions|sessions_created_at_not_null|NOT NULL created_at
sessions|sessions_expires_at_not_null|NOT NULL expires_at
sessions|sessions_id_not_null|NOT NULL id
sessions|sessions_pkey|PRIMARY KEY (id)
sessions|sessions_token_hash_key|UNIQUE (token_hash)
sessions|sessions_token_hash_not_null|NOT NULL token_hash
sessions|sessions_user_id_fkey|FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
sessions|sessions_user_id_not_null|NOT NULL user_id
formations|formations_created_at_not_null|NOT NULL created_at
formations|formations_id_not_null|NOT NULL id
formations|formations_is_published_not_null|NOT NULL is_published
formations|formations_level_check|CHECK (((level)::text = ANY ((ARRAY['debutant'::character varying, 'intermediaire'::character varying, 'avance'::character varying])::text[])))
formations|formations_pkey|PRIMARY KEY (id)
formations|formations_position_not_null|NOT NULL "position"
formations|formations_price_xof_not_null|NOT NULL price_xof
formations|formations_slug_key|UNIQUE (slug)
formations|formations_slug_not_null|NOT NULL slug
formations|formations_title_not_null|NOT NULL title
formations|formations_updated_at_not_null|NOT NULL updated_at
modules|modules_formation_id_fkey|FOREIGN KEY (formation_id) REFERENCES formations(id) ON DELETE CASCADE
modules|modules_formation_id_not_null|NOT NULL formation_id
modules|modules_id_not_null|NOT NULL id
modules|modules_pkey|PRIMARY KEY (id)
modules|modules_position_not_null|NOT NULL "position"
modules|modules_title_not_null|NOT NULL title
lessons|lessons_id_not_null|NOT NULL id
lessons|lessons_is_free_preview_not_null|NOT NULL is_free_preview
lessons|lessons_module_id_fkey|FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE
lessons|lessons_module_id_not_null|NOT NULL module_id
lessons|lessons_pkey|PRIMARY KEY (id)
lessons|lessons_position_not_null|NOT NULL "position"
lessons|lessons_title_not_null|NOT NULL title
paths|paths_id_not_null|NOT NULL id
paths|paths_pkey|PRIMARY KEY (id)
paths|paths_position_not_null|NOT NULL "position"
paths|paths_slug_key|UNIQUE (slug)
paths|paths_slug_not_null|NOT NULL slug
paths|paths_title_not_null|NOT NULL title
path_formations|path_formations_formation_id_fkey|FOREIGN KEY (formation_id) REFERENCES formations(id) ON DELETE CASCADE
path_formations|path_formations_formation_id_not_null|NOT NULL formation_id
path_formations|path_formations_path_id_fkey|FOREIGN KEY (path_id) REFERENCES paths(id) ON DELETE CASCADE
path_formations|path_formations_path_id_not_null|NOT NULL path_id
path_formations|path_formations_pkey|PRIMARY KEY (path_id, formation_id)
path_formations|path_formations_position_not_null|NOT NULL "position"
plans|plans_features_not_null|NOT NULL features
plans|plans_id_not_null|NOT NULL id
plans|plans_is_active_not_null|NOT NULL is_active
plans|plans_name_not_null|NOT NULL name
plans|plans_pkey|PRIMARY KEY (id)
plans|plans_position_not_null|NOT NULL "position"
plans|plans_price_xof_not_null|NOT NULL price_xof
plans|plans_slug_key|UNIQUE (slug)
plans|plans_slug_not_null|NOT NULL slug
enrollments|enrollments_enrolled_at_not_null|NOT NULL enrolled_at
enrollments|enrollments_formation_id_fkey|FOREIGN KEY (formation_id) REFERENCES formations(id) ON DELETE CASCADE
enrollments|enrollments_formation_id_not_null|NOT NULL formation_id
enrollments|enrollments_id_not_null|NOT NULL id
enrollments|enrollments_pkey|PRIMARY KEY (id)
enrollments|enrollments_plan_id_fkey|FOREIGN KEY (plan_id) REFERENCES plans(id)
enrollments|enrollments_status_check|CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'completed'::character varying, 'cancelled'::character varying])::text[])))
enrollments|enrollments_status_not_null|NOT NULL status
enrollments|enrollments_user_id_fkey|FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
enrollments|enrollments_user_id_formation_id_key|UNIQUE (user_id, formation_id)
enrollments|enrollments_user_id_not_null|NOT NULL user_id
lesson_progress|lesson_progress_completed_not_null|NOT NULL completed
lesson_progress|lesson_progress_lesson_id_fkey|FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
lesson_progress|lesson_progress_lesson_id_not_null|NOT NULL lesson_id
lesson_progress|lesson_progress_pkey|PRIMARY KEY (user_id, lesson_id)
lesson_progress|lesson_progress_user_id_fkey|FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
lesson_progress|lesson_progress_user_id_not_null|NOT NULL user_id
payments|payments_amount_xof_not_null|NOT NULL amount_xof
payments|payments_created_at_not_null|NOT NULL created_at
payments|payments_formation_id_fkey|FOREIGN KEY (formation_id) REFERENCES formations(id) ON DELETE SET NULL
payments|payments_id_not_null|NOT NULL id
payments|payments_pkey|PRIMARY KEY (id)
payments|payments_plan_id_fkey|FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE SET NULL
payments|payments_status_check|CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'paid'::character varying, 'failed'::character varying, 'refunded'::character varying])::text[])))
payments|payments_status_not_null|NOT NULL status
payments|payments_user_id_fkey|FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
payments|payments_user_id_not_null|NOT NULL user_id
contact_messages|contact_messages_created_at_not_null|NOT NULL created_at
contact_messages|contact_messages_email_not_null|NOT NULL email
contact_messages|contact_messages_id_not_null|NOT NULL id
contact_messages|contact_messages_is_read_not_null|NOT NULL is_read
contact_messages|contact_messages_message_not_null|NOT NULL message
contact_messages|contact_messages_name_not_null|NOT NULL name
contact_messages|contact_messages_pkey|PRIMARY KEY (id)
student_profiles|student_profiles_goal_xof_not_null|NOT NULL goal_xof
student_profiles|student_profiles_pkey|PRIMARY KEY (user_id)
student_profiles|student_profiles_price_xof_not_null|NOT NULL price_xof
student_profiles|student_profiles_status_check|CHECK (((status)::text = ANY ((ARRAY['actif'::character varying, 'pause'::character varying, 'termine'::character varying, 'abandon'::character varying])::text[])))
student_profiles|student_profiles_status_not_null|NOT NULL status
student_profiles|student_profiles_updated_at_not_null|NOT NULL updated_at
student_profiles|student_profiles_user_id_fkey|FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
student_profiles|student_profiles_user_id_not_null|NOT NULL user_id
student_revenues|student_revenues_amount_xof_check|CHECK ((amount_xof > 0))
student_revenues|student_revenues_amount_xof_not_null|NOT NULL amount_xof
student_revenues|student_revenues_created_at_not_null|NOT NULL created_at
student_revenues|student_revenues_earned_on_not_null|NOT NULL earned_on
student_revenues|student_revenues_id_not_null|NOT NULL id
student_revenues|student_revenues_pkey|PRIMARY KEY (id)
student_revenues|student_revenues_units_check|CHECK ((units >= 0))
student_revenues|student_revenues_units_not_null|NOT NULL units
student_revenues|student_revenues_user_id_fkey|FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
student_revenues|student_revenues_user_id_not_null|NOT NULL user_id
ad_spends|ad_spends_amount_xof_check|CHECK ((amount_xof > 0))
ad_spends|ad_spends_amount_xof_not_null|NOT NULL amount_xof
ad_spends|ad_spends_created_at_not_null|NOT NULL created_at
ad_spends|ad_spends_id_not_null|NOT NULL id
ad_spends|ad_spends_leads_check|CHECK ((leads >= 0))
ad_spends|ad_spends_leads_not_null|NOT NULL leads
ad_spends|ad_spends_pkey|PRIMARY KEY (id)
ad_spends|ad_spends_spent_on_not_null|NOT NULL spent_on
ad_spends|ad_spends_user_id_fkey|FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
ad_spends|ad_spends_user_id_not_null|NOT NULL user_id
calls|calls_created_at_not_null|NOT NULL created_at
calls|calls_duration_minutes_not_null|NOT NULL duration_minutes
calls|calls_id_not_null|NOT NULL id
calls|calls_pkey|PRIMARY KEY (id)
calls|calls_scheduled_at_not_null|NOT NULL scheduled_at
calls|calls_status_check|CHECK (((status)::text = ANY ((ARRAY['prevu'::character varying, 'fait'::character varying, 'annule'::character varying, 'absent'::character varying])::text[])))
calls|calls_status_not_null|NOT NULL status
calls|calls_user_id_fkey|FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
calls|calls_user_id_not_null|NOT NULL user_id
student_expenses|student_expenses_amount_xof_check|CHECK ((amount_xof > 0))
student_expenses|student_expenses_amount_xof_not_null|NOT NULL amount_xof
student_expenses|student_expenses_created_at_not_null|NOT NULL created_at
student_expenses|student_expenses_id_not_null|NOT NULL id
student_expenses|student_expenses_pkey|PRIMARY KEY (id)
student_expenses|student_expenses_spent_on_not_null|NOT NULL spent_on
student_expenses|student_expenses_user_id_fkey|FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
student_expenses|student_expenses_user_id_not_null|NOT NULL user_id
-- The Winner School : STRUCTURE REELLE de la base defaultdb (Aiven, PostgreSQL 18)
-- Verifiee contre information_schema, pg_constraint et pg_indexes : 17 tables, 126 colonnes, 33 index
-- Usage : psql "$DATABASE_URL" -f structure_reelle.sql  (idempotent, sans donnees)

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ========== UTILISATEURS ==========
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name     VARCHAR(120) NOT NULL,
  email         VARCHAR(255) NOT NULL UNIQUE,
  phone         VARCHAR(30),
  password_hash TEXT NOT NULL,
  role          VARCHAR(20) NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
  avatar_url    TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sessions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);

-- ========== FORMATIONS ==========
CREATE TABLE IF NOT EXISTS formations (
  id           SERIAL PRIMARY KEY,
  slug         VARCHAR(100) NOT NULL UNIQUE,
  title        VARCHAR(200) NOT NULL,
  subtitle     TEXT,
  description  TEXT,
  cover_image  TEXT,
  cover_video  TEXT,
  price_xof    INTEGER NOT NULL DEFAULT 0,
  level        VARCHAR(20) DEFAULT 'debutant' CHECK (level IN ('debutant', 'intermediaire', 'avance')),
  position     INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS modules (
  id           SERIAL PRIMARY KEY,
  formation_id INTEGER NOT NULL REFERENCES formations(id) ON DELETE CASCADE,
  title        VARCHAR(200) NOT NULL,
  position     INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_modules_formation ON modules(formation_id);

CREATE TABLE IF NOT EXISTS lessons (
  id               SERIAL PRIMARY KEY,
  module_id        INTEGER NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  title            VARCHAR(200) NOT NULL,
  content          TEXT,
  video_url        TEXT,
  duration_minutes INTEGER,
  position         INTEGER NOT NULL DEFAULT 0,
  is_free_preview  BOOLEAN NOT NULL DEFAULT FALSE
);
CREATE INDEX IF NOT EXISTS idx_lessons_module ON lessons(module_id);

-- ========== PARCOURS ==========
CREATE TABLE IF NOT EXISTS paths (
  id          SERIAL PRIMARY KEY,
  slug        VARCHAR(100) NOT NULL UNIQUE,
  title       VARCHAR(200) NOT NULL,
  description TEXT,
  position    INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS path_formations (
  path_id      INTEGER NOT NULL REFERENCES paths(id) ON DELETE CASCADE,
  formation_id INTEGER NOT NULL REFERENCES formations(id) ON DELETE CASCADE,
  position     INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (path_id, formation_id)
);

-- ========== TARIFS ==========
CREATE TABLE IF NOT EXISTS plans (
  id            SERIAL PRIMARY KEY,
  slug          VARCHAR(50) NOT NULL UNIQUE,
  name          VARCHAR(100) NOT NULL,
  price_xof     INTEGER NOT NULL,
  duration_days INTEGER,
  features      JSONB NOT NULL DEFAULT '[]',
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  position      INTEGER NOT NULL DEFAULT 0
);

-- ========== INSCRIPTIONS & SUIVI ==========
CREATE TABLE IF NOT EXISTS enrollments (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  formation_id INTEGER NOT NULL REFERENCES formations(id) ON DELETE CASCADE,
  plan_id      INTEGER REFERENCES plans(id),
  status       VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  enrolled_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  UNIQUE (user_id, formation_id)
);
CREATE INDEX IF NOT EXISTS idx_enrollments_user ON enrollments(user_id);

CREATE TABLE IF NOT EXISTS lesson_progress (
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id    INTEGER NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  completed    BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  PRIMARY KEY (user_id, lesson_id)
);

-- ========== PAIEMENTS ==========
CREATE TABLE IF NOT EXISTS payments (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  formation_id INTEGER REFERENCES formations(id) ON DELETE SET NULL,
  plan_id      INTEGER REFERENCES plans(id) ON DELETE SET NULL,
  amount_xof   INTEGER NOT NULL,
  method       VARCHAR(30),
  provider_ref VARCHAR(120),
  status       VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'refunded')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  paid_at      TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id);

-- ========== CONTACT ==========
CREATE TABLE IF NOT EXISTS contact_messages (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(120) NOT NULL,
  email      VARCHAR(255) NOT NULL,
  subject    VARCHAR(200),
  message    TEXT NOT NULL,
  is_read    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ========== SUIVI DES ETUDIANTS ==========
CREATE TABLE IF NOT EXISTS student_profiles (
  user_id    UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  niche      VARCHAR(120),
  product    VARCHAR(200),
  goal_xof   INTEGER NOT NULL DEFAULT 0,
  status     VARCHAR(20) NOT NULL DEFAULT 'actif' CHECK (status IN ('actif', 'pause', 'termine', 'abandon')),
  notes      TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  price_xof  INTEGER NOT NULL DEFAULT 0,
  channel    VARCHAR(60),
  sales_url  TEXT
);

CREATE TABLE IF NOT EXISTS student_revenues (
  id         SERIAL PRIMARY KEY,
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount_xof INTEGER NOT NULL CHECK (amount_xof > 0),
  source     VARCHAR(100),
  note       VARCHAR(500),
  earned_on  DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  units      INTEGER NOT NULL DEFAULT 0 CHECK (units >= 0)
);
CREATE INDEX IF NOT EXISTS idx_revenues_user ON student_revenues(user_id, earned_on);

CREATE TABLE IF NOT EXISTS ad_spends (
  id         SERIAL PRIMARY KEY,
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount_xof INTEGER NOT NULL CHECK (amount_xof > 0),
  platform   VARCHAR(50),
  note       VARCHAR(500),
  spent_on   DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  leads      INTEGER NOT NULL DEFAULT 0 CHECK (leads >= 0)
);
CREATE INDEX IF NOT EXISTS idx_ads_user ON ad_spends(user_id, spent_on);

CREATE TABLE IF NOT EXISTS student_expenses (
  id         SERIAL PRIMARY KEY,
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount_xof INTEGER NOT NULL CHECK (amount_xof > 0),
  label      VARCHAR(100),
  note       VARCHAR(500),
  spent_on   DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_expenses_user ON student_expenses(user_id, spent_on);

CREATE TABLE IF NOT EXISTS calls (
  id               SERIAL PRIMARY KEY,
  user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  scheduled_at     TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  topic            VARCHAR(200),
  meeting_url      TEXT,
  status           VARCHAR(20) NOT NULL DEFAULT 'prevu' CHECK (status IN ('prevu', 'fait', 'annule', 'absent')),
  notes            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_calls_user ON calls(user_id, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_calls_date ON calls(scheduled_at);