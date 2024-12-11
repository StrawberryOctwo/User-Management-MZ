--
-- PostgreSQL database dump
--

-- Dumped from database version 16.3
-- Dumped by pg_dump version 16.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: absences; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.absences (
    id integer NOT NULL,
    reason character varying NOT NULL,
    proof character varying NOT NULL,
    status character varying NOT NULL,
    "studentId" integer
);


ALTER TABLE public.absences OWNER TO postgres;

--
-- Name: absences_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.absences_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.absences_id_seq OWNER TO postgres;

--
-- Name: absences_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.absences_id_seq OWNED BY public.absences.id;


--
-- Name: class_sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.class_sessions (
    id integer NOT NULL,
    name character varying NOT NULL,
    price double precision,
    schedule character varying NOT NULL,
    "sessionType" character varying NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "isHolidayCourse" boolean DEFAULT false NOT NULL,
    "teacherId" integer,
    "topicId" integer,
    "locationId" integer
);


ALTER TABLE public.class_sessions OWNER TO postgres;

--
-- Name: class_sessions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.class_sessions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.class_sessions_id_seq OWNER TO postgres;

--
-- Name: class_sessions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.class_sessions_id_seq OWNED BY public.class_sessions.id;


--
-- Name: class_sessions_students_students; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.class_sessions_students_students (
    "classSessionsId" integer NOT NULL,
    "studentsId" integer NOT NULL
);


ALTER TABLE public.class_sessions_students_students OWNER TO postgres;

--
-- Name: events; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.events (
    id integer NOT NULL,
    title character varying NOT NULL,
    description character varying NOT NULL,
    "startDateTime" timestamp without time zone NOT NULL,
    "endDateTime" timestamp without time zone NOT NULL,
    "isAllDay" boolean DEFAULT false NOT NULL,
    "isCompleted" boolean DEFAULT false NOT NULL
);


ALTER TABLE public.events OWNER TO postgres;

--
-- Name: events_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.events_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.events_id_seq OWNER TO postgres;

--
-- Name: events_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.events_id_seq OWNED BY public.events.id;


--
-- Name: events_locations_locations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.events_locations_locations (
    "eventsId" integer NOT NULL,
    "locationsId" integer NOT NULL
);


ALTER TABLE public.events_locations_locations OWNER TO postgres;

--
-- Name: events_specific_users_users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.events_specific_users_users (
    "eventsId" integer NOT NULL,
    "usersId" integer NOT NULL
);


ALTER TABLE public.events_specific_users_users OWNER TO postgres;

--
-- Name: file_uploads; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.file_uploads (
    id integer NOT NULL,
    type character varying NOT NULL,
    "uploadedAt" timestamp without time zone NOT NULL,
    "userId" integer
);


ALTER TABLE public.file_uploads OWNER TO postgres;

--
-- Name: file_uploads_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.file_uploads_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.file_uploads_id_seq OWNER TO postgres;

--
-- Name: file_uploads_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.file_uploads_id_seq OWNED BY public.file_uploads.id;


--
-- Name: franchises; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.franchises (
    id integer NOT NULL,
    name character varying NOT NULL,
    "ownerName" character varying NOT NULL,
    "cardHolderName" character varying NOT NULL,
    iban character varying NOT NULL,
    bic character varying NOT NULL,
    status character varying NOT NULL,
    "totalEmployees" integer NOT NULL
);


ALTER TABLE public.franchises OWNER TO postgres;

--
-- Name: franchises_admins_users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.franchises_admins_users (
    "franchisesId" integer NOT NULL,
    "usersId" integer NOT NULL
);


ALTER TABLE public.franchises_admins_users OWNER TO postgres;

--
-- Name: franchises_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.franchises_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.franchises_id_seq OWNER TO postgres;

--
-- Name: franchises_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.franchises_id_seq OWNED BY public.franchises.id;


--
-- Name: locations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.locations (
    id integer NOT NULL,
    name character varying NOT NULL,
    address character varying NOT NULL,
    "franchiseId" integer
);


ALTER TABLE public.locations OWNER TO postgres;

--
-- Name: locations_admins_users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.locations_admins_users (
    "locationId" integer NOT NULL,
    "userId" integer NOT NULL
);


ALTER TABLE public.locations_admins_users OWNER TO postgres;

--
-- Name: locations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.locations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.locations_id_seq OWNER TO postgres;

--
-- Name: locations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.locations_id_seq OWNED BY public.locations.id;


--
-- Name: locations_teachers_teachers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.locations_teachers_teachers (
    "locationId" integer NOT NULL,
    "teacherId" integer NOT NULL
);


ALTER TABLE public.locations_teachers_teachers OWNER TO postgres;

--
-- Name: parents; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.parents (
    id integer NOT NULL,
    "accountHolder" character varying NOT NULL,
    iban character varying NOT NULL,
    bic character varying NOT NULL
);


ALTER TABLE public.parents OWNER TO postgres;

--
-- Name: parents_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.parents_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.parents_id_seq OWNER TO postgres;

--
-- Name: parents_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.parents_id_seq OWNED BY public.parents.id;


--
-- Name: payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payments (
    id integer NOT NULL,
    amount integer NOT NULL,
    "paymentStatus" character varying NOT NULL,
    "paymentDate" timestamp without time zone NOT NULL,
    "lastUpdate" timestamp without time zone NOT NULL,
    "sessionId" integer,
    "userId" integer
);


ALTER TABLE public.payments OWNER TO postgres;

--
-- Name: payments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.payments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.payments_id_seq OWNER TO postgres;

--
-- Name: payments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.payments_id_seq OWNED BY public.payments.id;


--
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    id integer NOT NULL,
    name character varying NOT NULL
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.roles_id_seq OWNER TO postgres;

--
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- Name: session_reports; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.session_reports (
    id integer NOT NULL,
    "reportType" character varying NOT NULL,
    comments character varying NOT NULL,
    "sessionId" integer,
    "studentId" integer
);


ALTER TABLE public.session_reports OWNER TO postgres;

--
-- Name: session_reports_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.session_reports_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.session_reports_id_seq OWNER TO postgres;

--
-- Name: session_reports_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.session_reports_id_seq OWNED BY public.session_reports.id;


--
-- Name: students; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.students (
    id integer NOT NULL,
    "payPerHour" integer NOT NULL,
    status character varying NOT NULL,
    "gradeLevel" integer NOT NULL,
    "contractType" character varying NOT NULL,
    "contractEndDate" timestamp without time zone NOT NULL,
    notes character varying NOT NULL,
    "availableDates" character varying NOT NULL,
    "userId" integer,
    "locationId" integer,
    "parentId" integer
);


ALTER TABLE public.students OWNER TO postgres;

--
-- Name: students_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.students_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.students_id_seq OWNER TO postgres;

--
-- Name: students_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.students_id_seq OWNED BY public.students.id;


--
-- Name: students_topics_topics; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.students_topics_topics (
    "studentId" integer NOT NULL,
    "topicId" integer NOT NULL
);


ALTER TABLE public.students_topics_topics OWNER TO postgres;

--
-- Name: teachers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.teachers (
    id integer NOT NULL,
    "employeeNumber" character varying NOT NULL,
    "idNumber" character varying NOT NULL,
    "taxNumber" character varying NOT NULL,
    "contractStartDate" timestamp without time zone NOT NULL,
    "contractEndDate" timestamp without time zone NOT NULL,
    "hourlyRate" integer NOT NULL,
    bank character varying NOT NULL,
    iban character varying NOT NULL,
    bic character varying NOT NULL,
    "userId" integer
);


ALTER TABLE public.teachers OWNER TO postgres;

--
-- Name: teachers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.teachers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.teachers_id_seq OWNER TO postgres;

--
-- Name: teachers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.teachers_id_seq OWNED BY public.teachers.id;


--
-- Name: teachers_topics_topics; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.teachers_topics_topics (
    "teachersId" integer NOT NULL,
    "topicsId" integer NOT NULL
);


ALTER TABLE public.teachers_topics_topics OWNER TO postgres;

--
-- Name: topics; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.topics (
    id integer NOT NULL,
    name character varying NOT NULL,
    description character varying NOT NULL
);


ALTER TABLE public.topics OWNER TO postgres;

--
-- Name: topics_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.topics_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.topics_id_seq OWNER TO postgres;

--
-- Name: topics_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.topics_id_seq OWNED BY public.topics.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    "firstName" character varying NOT NULL,
    "lastName" character varying NOT NULL,
    dob timestamp without time zone NOT NULL,
    email character varying NOT NULL,
    password character varying NOT NULL,
    address character varying NOT NULL,
    "postalCode" character varying NOT NULL,
    "phoneNumber" character varying NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: users_roles_roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users_roles_roles (
    "usersId" integer NOT NULL,
    "rolesId" integer NOT NULL
);


ALTER TABLE public.users_roles_roles OWNER TO postgres;

--
-- Name: absences id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.absences ALTER COLUMN id SET DEFAULT nextval('public.absences_id_seq'::regclass);


--
-- Name: class_sessions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.class_sessions ALTER COLUMN id SET DEFAULT nextval('public.class_sessions_id_seq'::regclass);


--
-- Name: events id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.events ALTER COLUMN id SET DEFAULT nextval('public.events_id_seq'::regclass);


--
-- Name: file_uploads id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.file_uploads ALTER COLUMN id SET DEFAULT nextval('public.file_uploads_id_seq'::regclass);


--
-- Name: franchises id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.franchises ALTER COLUMN id SET DEFAULT nextval('public.franchises_id_seq'::regclass);


--
-- Name: locations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.locations ALTER COLUMN id SET DEFAULT nextval('public.locations_id_seq'::regclass);


--
-- Name: parents id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.parents ALTER COLUMN id SET DEFAULT nextval('public.parents_id_seq'::regclass);


--
-- Name: payments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments ALTER COLUMN id SET DEFAULT nextval('public.payments_id_seq'::regclass);


--
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- Name: session_reports id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.session_reports ALTER COLUMN id SET DEFAULT nextval('public.session_reports_id_seq'::regclass);


--
-- Name: students id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.students ALTER COLUMN id SET DEFAULT nextval('public.students_id_seq'::regclass);


--
-- Name: teachers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teachers ALTER COLUMN id SET DEFAULT nextval('public.teachers_id_seq'::regclass);


--
-- Name: topics id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.topics ALTER COLUMN id SET DEFAULT nextval('public.topics_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: payments PK_197ab7af18c93fbb0c9b28b4a59; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT "PK_197ab7af18c93fbb0c9b28b4a59" PRIMARY KEY (id);


--
-- Name: locations_teachers_teachers PK_29844bede7a18ce46821f9a5bce; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.locations_teachers_teachers
    ADD CONSTRAINT "PK_29844bede7a18ce46821f9a5bce" PRIMARY KEY ("locationId", "teacherId");


--
-- Name: events PK_40731c7151fe4be3116e45ddf73; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT "PK_40731c7151fe4be3116e45ddf73" PRIMARY KEY (id);


--
-- Name: teachers_topics_topics PK_40741835dabf85c0a30fd7499c8; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teachers_topics_topics
    ADD CONSTRAINT "PK_40741835dabf85c0a30fd7499c8" PRIMARY KEY ("teachersId", "topicsId");


--
-- Name: events_locations_locations PK_52c0b564c7a04601839cd43e9f2; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.events_locations_locations
    ADD CONSTRAINT "PK_52c0b564c7a04601839cd43e9f2" PRIMARY KEY ("eventsId", "locationsId");


--
-- Name: events_specific_users_users PK_5b6dc5c0b91bc0f3766496b2981; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.events_specific_users_users
    ADD CONSTRAINT "PK_5b6dc5c0b91bc0f3766496b2981" PRIMARY KEY ("eventsId", "usersId");


--
-- Name: franchises PK_5ff74e1ad0637c499c4ed139e2c; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.franchises
    ADD CONSTRAINT "PK_5ff74e1ad0637c499c4ed139e2c" PRIMARY KEY (id);


--
-- Name: users_roles_roles PK_6c1a055682c229f5a865f2080c1; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users_roles_roles
    ADD CONSTRAINT "PK_6c1a055682c229f5a865f2080c1" PRIMARY KEY ("usersId", "rolesId");


--
-- Name: students_topics_topics PK_6da22d3aefacf3cdc5738d72089; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.students_topics_topics
    ADD CONSTRAINT "PK_6da22d3aefacf3cdc5738d72089" PRIMARY KEY ("studentId", "topicId");


--
-- Name: locations PK_7cc1c9e3853b94816c094825e74; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.locations
    ADD CONSTRAINT "PK_7cc1c9e3853b94816c094825e74" PRIMARY KEY (id);


--
-- Name: students PK_7d7f07271ad4ce999880713f05e; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT "PK_7d7f07271ad4ce999880713f05e" PRIMARY KEY (id);


--
-- Name: locations_admins_users PK_84abedf0d35ed4691f71b8b1a47; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.locations_admins_users
    ADD CONSTRAINT "PK_84abedf0d35ed4691f71b8b1a47" PRIMARY KEY ("locationId", "userId");


--
-- Name: parents PK_9a4dc67c7b8e6a9cb918938d353; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.parents
    ADD CONSTRAINT "PK_9a4dc67c7b8e6a9cb918938d353" PRIMARY KEY (id);


--
-- Name: users PK_a3ffb1c0c8416b9fc6f907b7433; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY (id);


--
-- Name: teachers PK_a8d4f83be3abe4c687b0a0093c8; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teachers
    ADD CONSTRAINT "PK_a8d4f83be3abe4c687b0a0093c8" PRIMARY KEY (id);


--
-- Name: file_uploads PK_b3ebfc99a8b660f0bc64a052b42; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.file_uploads
    ADD CONSTRAINT "PK_b3ebfc99a8b660f0bc64a052b42" PRIMARY KEY (id);


--
-- Name: session_reports PK_bce9e40f36bf25dcd63bedf0822; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.session_reports
    ADD CONSTRAINT "PK_bce9e40f36bf25dcd63bedf0822" PRIMARY KEY (id);


--
-- Name: absences PK_bd79346866fea8ac6f269252748; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.absences
    ADD CONSTRAINT "PK_bd79346866fea8ac6f269252748" PRIMARY KEY (id);


--
-- Name: roles PK_c1433d71a4838793a49dcad46ab; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT "PK_c1433d71a4838793a49dcad46ab" PRIMARY KEY (id);


--
-- Name: class_sessions PK_dc034da48c6e0cf95c51f606c4e; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.class_sessions
    ADD CONSTRAINT "PK_dc034da48c6e0cf95c51f606c4e" PRIMARY KEY (id);


--
-- Name: franchises_admins_users PK_df50a64dd0864e175a8a3bc3d2e; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.franchises_admins_users
    ADD CONSTRAINT "PK_df50a64dd0864e175a8a3bc3d2e" PRIMARY KEY ("franchisesId", "usersId");


--
-- Name: topics PK_e4aa99a3fa60ec3a37d1fc4e853; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.topics
    ADD CONSTRAINT "PK_e4aa99a3fa60ec3a37d1fc4e853" PRIMARY KEY (id);


--
-- Name: class_sessions_students_students PK_ea6cbaaa3e1e0e7c09c45ee5cc6; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.class_sessions_students_students
    ADD CONSTRAINT "PK_ea6cbaaa3e1e0e7c09c45ee5cc6" PRIMARY KEY ("classSessionsId", "studentsId");


--
-- Name: roles UQ_648e3f5447f725579d7d4ffdfb7; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT "UQ_648e3f5447f725579d7d4ffdfb7" UNIQUE (name);


--
-- Name: users UQ_97672ac88f789774dd47f7c8be3; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE (email);


--
-- Name: IDX_0ec4e9393c30242bd32c0fab2b; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_0ec4e9393c30242bd32c0fab2b" ON public.franchises_admins_users USING btree ("usersId");


--
-- Name: IDX_287b7a1682ac149f0c53010b18; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_287b7a1682ac149f0c53010b18" ON public.events_locations_locations USING btree ("locationsId");


--
-- Name: IDX_3f0c640cfc4c3278e3e2e1ef24; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_3f0c640cfc4c3278e3e2e1ef24" ON public.locations_admins_users USING btree ("locationId");


--
-- Name: IDX_438c5be8e4d7611ed68a697d88; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_438c5be8e4d7611ed68a697d88" ON public.events_specific_users_users USING btree ("eventsId");


--
-- Name: IDX_452f356dc71c515062c6397e23; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_452f356dc71c515062c6397e23" ON public.locations_teachers_teachers USING btree ("teacherId");


--
-- Name: IDX_50a01f7b1bd722842c7edcdf94; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_50a01f7b1bd722842c7edcdf94" ON public.events_specific_users_users USING btree ("usersId");


--
-- Name: IDX_5248e99a69ac0e0becee6bd8b3; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_5248e99a69ac0e0becee6bd8b3" ON public.students_topics_topics USING btree ("studentId");


--
-- Name: IDX_7bc5e42b6bfed2025eac4b1aef; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_7bc5e42b6bfed2025eac4b1aef" ON public.teachers_topics_topics USING btree ("topicsId");


--
-- Name: IDX_89dd65f8f19d9e6373fb5969f7; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_89dd65f8f19d9e6373fb5969f7" ON public.locations_admins_users USING btree ("userId");


--
-- Name: IDX_8ee72f5aa04501915783699181; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_8ee72f5aa04501915783699181" ON public.franchises_admins_users USING btree ("franchisesId");


--
-- Name: IDX_aafcc13d30fabee622b1d45011; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_aafcc13d30fabee622b1d45011" ON public.events_locations_locations USING btree ("eventsId");


--
-- Name: IDX_b2f0366aa9349789527e0c36d9; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_b2f0366aa9349789527e0c36d9" ON public.users_roles_roles USING btree ("rolesId");


--
-- Name: IDX_c68a7fdff966de41ad119fecf1; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_c68a7fdff966de41ad119fecf1" ON public.students_topics_topics USING btree ("topicId");


--
-- Name: IDX_c7c61d3e82400092e39c63764b; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_c7c61d3e82400092e39c63764b" ON public.teachers_topics_topics USING btree ("teachersId");


--
-- Name: IDX_cb9ffdfb7f0188246ada711f6e; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_cb9ffdfb7f0188246ada711f6e" ON public.class_sessions_students_students USING btree ("classSessionsId");


--
-- Name: IDX_d05f272a7c199afa33b1aaca88; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_d05f272a7c199afa33b1aaca88" ON public.locations_teachers_teachers USING btree ("locationId");


--
-- Name: IDX_df951a64f09865171d2d7a502b; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_df951a64f09865171d2d7a502b" ON public.users_roles_roles USING btree ("usersId");


--
-- Name: IDX_f74cf61cd4679bfec142163871; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_f74cf61cd4679bfec142163871" ON public.class_sessions_students_students USING btree ("studentsId");


--
-- Name: franchises_admins_users FK_0ec4e9393c30242bd32c0fab2b8; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.franchises_admins_users
    ADD CONSTRAINT "FK_0ec4e9393c30242bd32c0fab2b8" FOREIGN KEY ("usersId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: events_locations_locations FK_287b7a1682ac149f0c53010b18a; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.events_locations_locations
    ADD CONSTRAINT "FK_287b7a1682ac149f0c53010b18a" FOREIGN KEY ("locationsId") REFERENCES public.locations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: locations_admins_users FK_3f0c640cfc4c3278e3e2e1ef24a; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.locations_admins_users
    ADD CONSTRAINT "FK_3f0c640cfc4c3278e3e2e1ef24a" FOREIGN KEY ("locationId") REFERENCES public.locations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: locations FK_4173f6574be7a02e34ad23d8a39; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.locations
    ADD CONSTRAINT "FK_4173f6574be7a02e34ad23d8a39" FOREIGN KEY ("franchiseId") REFERENCES public.franchises(id);


--
-- Name: events_specific_users_users FK_438c5be8e4d7611ed68a697d88f; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.events_specific_users_users
    ADD CONSTRAINT "FK_438c5be8e4d7611ed68a697d88f" FOREIGN KEY ("eventsId") REFERENCES public.events(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: locations_teachers_teachers FK_452f356dc71c515062c6397e233; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.locations_teachers_teachers
    ADD CONSTRAINT "FK_452f356dc71c515062c6397e233" FOREIGN KEY ("teacherId") REFERENCES public.teachers(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: session_reports FK_46a2dfd2114c66b89e8f712333d; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.session_reports
    ADD CONSTRAINT "FK_46a2dfd2114c66b89e8f712333d" FOREIGN KEY ("sessionId") REFERENCES public.class_sessions(id);


--
-- Name: teachers FK_4d8041cbc103a5142fa2f2afad4; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teachers
    ADD CONSTRAINT "FK_4d8041cbc103a5142fa2f2afad4" FOREIGN KEY ("userId") REFERENCES public.users(id);


--
-- Name: events_specific_users_users FK_50a01f7b1bd722842c7edcdf94a; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.events_specific_users_users
    ADD CONSTRAINT "FK_50a01f7b1bd722842c7edcdf94a" FOREIGN KEY ("usersId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: students_topics_topics FK_5248e99a69ac0e0becee6bd8b3d; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.students_topics_topics
    ADD CONSTRAINT "FK_5248e99a69ac0e0becee6bd8b3d" FOREIGN KEY ("studentId") REFERENCES public.students(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: absences FK_609af015cd74a36ffe39140ca6d; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.absences
    ADD CONSTRAINT "FK_609af015cd74a36ffe39140ca6d" FOREIGN KEY ("studentId") REFERENCES public.students(id);


--
-- Name: class_sessions FK_65621dccf831fc3765dfeeae25d; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.class_sessions
    ADD CONSTRAINT "FK_65621dccf831fc3765dfeeae25d" FOREIGN KEY ("teacherId") REFERENCES public.teachers(id);


--
-- Name: students FK_6fea943b3b432a9e3e38d53c31b; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT "FK_6fea943b3b432a9e3e38d53c31b" FOREIGN KEY ("parentId") REFERENCES public.parents(id);


--
-- Name: session_reports FK_7033341b3270ce777709f5bd494; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.session_reports
    ADD CONSTRAINT "FK_7033341b3270ce777709f5bd494" FOREIGN KEY ("studentId") REFERENCES public.students(id);


--
-- Name: teachers_topics_topics FK_7bc5e42b6bfed2025eac4b1aef8; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teachers_topics_topics
    ADD CONSTRAINT "FK_7bc5e42b6bfed2025eac4b1aef8" FOREIGN KEY ("topicsId") REFERENCES public.topics(id);


--
-- Name: locations_admins_users FK_89dd65f8f19d9e6373fb5969f70; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.locations_admins_users
    ADD CONSTRAINT "FK_89dd65f8f19d9e6373fb5969f70" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: franchises_admins_users FK_8ee72f5aa04501915783699181b; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.franchises_admins_users
    ADD CONSTRAINT "FK_8ee72f5aa04501915783699181b" FOREIGN KEY ("franchisesId") REFERENCES public.franchises(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: file_uploads FK_94ebfb8561e9ec5a73f48253039; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.file_uploads
    ADD CONSTRAINT "FK_94ebfb8561e9ec5a73f48253039" FOREIGN KEY ("userId") REFERENCES public.users(id);


--
-- Name: events_locations_locations FK_aafcc13d30fabee622b1d45011e; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.events_locations_locations
    ADD CONSTRAINT "FK_aafcc13d30fabee622b1d45011e" FOREIGN KEY ("eventsId") REFERENCES public.events(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: users_roles_roles FK_b2f0366aa9349789527e0c36d97; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users_roles_roles
    ADD CONSTRAINT "FK_b2f0366aa9349789527e0c36d97" FOREIGN KEY ("rolesId") REFERENCES public.roles(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: class_sessions FK_c02719f8127d040532fa39642b5; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.class_sessions
    ADD CONSTRAINT "FK_c02719f8127d040532fa39642b5" FOREIGN KEY ("topicId") REFERENCES public.topics(id);


--
-- Name: students_topics_topics FK_c68a7fdff966de41ad119fecf14; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.students_topics_topics
    ADD CONSTRAINT "FK_c68a7fdff966de41ad119fecf14" FOREIGN KEY ("topicId") REFERENCES public.topics(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: teachers_topics_topics FK_c7c61d3e82400092e39c63764bc; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teachers_topics_topics
    ADD CONSTRAINT "FK_c7c61d3e82400092e39c63764bc" FOREIGN KEY ("teachersId") REFERENCES public.teachers(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: payments FK_c96a63d98681cc603f7300deeb5; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT "FK_c96a63d98681cc603f7300deeb5" FOREIGN KEY ("sessionId") REFERENCES public.class_sessions(id);


--
-- Name: class_sessions_students_students FK_cb9ffdfb7f0188246ada711f6ef; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.class_sessions_students_students
    ADD CONSTRAINT "FK_cb9ffdfb7f0188246ada711f6ef" FOREIGN KEY ("classSessionsId") REFERENCES public.class_sessions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: locations_teachers_teachers FK_d05f272a7c199afa33b1aaca887; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.locations_teachers_teachers
    ADD CONSTRAINT "FK_d05f272a7c199afa33b1aaca887" FOREIGN KEY ("locationId") REFERENCES public.locations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: payments FK_d35cb3c13a18e1ea1705b2817b1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT "FK_d35cb3c13a18e1ea1705b2817b1" FOREIGN KEY ("userId") REFERENCES public.users(id);


--
-- Name: users_roles_roles FK_df951a64f09865171d2d7a502b1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users_roles_roles
    ADD CONSTRAINT "FK_df951a64f09865171d2d7a502b1" FOREIGN KEY ("usersId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: students FK_e0208b4f964e609959aff431bf9; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT "FK_e0208b4f964e609959aff431bf9" FOREIGN KEY ("userId") REFERENCES public.users(id);


--
-- Name: students FK_f0a6ea0bc1a1f9f7de53a80ea0a; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT "FK_f0a6ea0bc1a1f9f7de53a80ea0a" FOREIGN KEY ("locationId") REFERENCES public.locations(id);


--
-- Name: class_sessions FK_f0fbef68ebb93d6508efe5a7bfa; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.class_sessions
    ADD CONSTRAINT "FK_f0fbef68ebb93d6508efe5a7bfa" FOREIGN KEY ("locationId") REFERENCES public.locations(id);


--
-- Name: class_sessions_students_students FK_f74cf61cd4679bfec142163871a; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.class_sessions_students_students
    ADD CONSTRAINT "FK_f74cf61cd4679bfec142163871a" FOREIGN KEY ("studentsId") REFERENCES public.students(id);


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;
GRANT ALL ON SCHEMA public TO PUBLIC;


--
-- PostgreSQL database dump complete
--

