--
-- PostgreSQL database dump
--

\restrict WFXqyP313MZo7fHRtWvuq7MrjbUvoLIq26BiZUojNMGIdQ8bbUZLiVEluUkaOHX

-- Dumped from database version 14.19 (Ubuntu 14.19-0ubuntu0.22.04.1)
-- Dumped by pg_dump version 16.10

-- Started on 2025-11-20 09:18:52

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
-- TOC entry 4 (class 2615 OID 2200)
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- TOC entry 851 (class 1247 OID 16711)
-- Name: user_role; Type: TYPE; Schema: public; Owner: d104
--

CREATE TYPE public.user_role AS ENUM (
    'USER',
    'ADMIN'
);


ALTER TYPE public.user_role OWNER TO d104;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 220 (class 1259 OID 16779)
-- Name: categories; Type: TABLE; Schema: public; Owner: d104
--

CREATE TABLE public.categories (
    category_id integer NOT NULL,
    name character varying(100) NOT NULL
);


ALTER TABLE public.categories OWNER TO d104;

--
-- TOC entry 219 (class 1259 OID 16778)
-- Name: categories_category_id_seq; Type: SEQUENCE; Schema: public; Owner: d104
--

CREATE SEQUENCE public.categories_category_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.categories_category_id_seq OWNER TO d104;

--
-- TOC entry 3505 (class 0 OID 0)
-- Dependencies: 219
-- Name: categories_category_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: d104
--

ALTER SEQUENCE public.categories_category_id_seq OWNED BY public.categories.category_id;


--
-- TOC entry 212 (class 1259 OID 16723)
-- Name: code_groups; Type: TABLE; Schema: public; Owner: d104
--

CREATE TABLE public.code_groups (
    code_group_id integer NOT NULL,
    name character varying(100) NOT NULL,
    is_used boolean DEFAULT true
);


ALTER TABLE public.code_groups OWNER TO d104;

--
-- TOC entry 211 (class 1259 OID 16722)
-- Name: code_groups_code_group_id_seq; Type: SEQUENCE; Schema: public; Owner: d104
--

CREATE SEQUENCE public.code_groups_code_group_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.code_groups_code_group_id_seq OWNER TO d104;

--
-- TOC entry 3506 (class 0 OID 0)
-- Dependencies: 211
-- Name: code_groups_code_group_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: d104
--

ALTER SEQUENCE public.code_groups_code_group_id_seq OWNED BY public.code_groups.code_group_id;


--
-- TOC entry 214 (class 1259 OID 16731)
-- Name: codes; Type: TABLE; Schema: public; Owner: d104
--

CREATE TABLE public.codes (
    code_id integer NOT NULL,
    code_group_id integer NOT NULL,
    name character varying(100) NOT NULL,
    code_number integer NOT NULL,
    is_used boolean DEFAULT true
);


ALTER TABLE public.codes OWNER TO d104;

--
-- TOC entry 213 (class 1259 OID 16730)
-- Name: codes_code_id_seq; Type: SEQUENCE; Schema: public; Owner: d104
--

CREATE SEQUENCE public.codes_code_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.codes_code_id_seq OWNER TO d104;

--
-- TOC entry 3507 (class 0 OID 0)
-- Dependencies: 213
-- Name: codes_code_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: d104
--

ALTER SEQUENCE public.codes_code_id_seq OWNED BY public.codes.code_id;


--
-- TOC entry 228 (class 1259 OID 16867)
-- Name: discussion_contents; Type: TABLE; Schema: public; Owner: d104
--

CREATE TABLE public.discussion_contents (
    discussion_content_id integer NOT NULL,
    discussion_id integer NOT NULL,
    creator_id integer NOT NULL,
    content text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    content_number integer NOT NULL,
    code_id integer NOT NULL
);


ALTER TABLE public.discussion_contents OWNER TO d104;

--
-- TOC entry 227 (class 1259 OID 16866)
-- Name: discussion_contents_discussion_content_id_seq; Type: SEQUENCE; Schema: public; Owner: d104
--

CREATE SEQUENCE public.discussion_contents_discussion_content_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.discussion_contents_discussion_content_id_seq OWNER TO d104;

--
-- TOC entry 3508 (class 0 OID 0)
-- Dependencies: 227
-- Name: discussion_contents_discussion_content_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: d104
--

ALTER SEQUENCE public.discussion_contents_discussion_content_id_seq OWNED BY public.discussion_contents.discussion_content_id;


--
-- TOC entry 233 (class 1259 OID 16943)
-- Name: discussion_reports; Type: TABLE; Schema: public; Owner: d104
--

CREATE TABLE public.discussion_reports (
    discussion_content_id integer NOT NULL,
    reporter_id integer NOT NULL,
    reported_user_id integer NOT NULL,
    reviewer_id integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    reason character varying(400) NOT NULL,
    admin_reason character varying(200),
    reviewed_at timestamp without time zone,
    code_id integer NOT NULL,
    discussion_report_id integer NOT NULL
);


ALTER TABLE public.discussion_reports OWNER TO d104;

--
-- TOC entry 238 (class 1259 OID 17426)
-- Name: discussion_report_id_seq; Type: SEQUENCE; Schema: public; Owner: d104
--

CREATE SEQUENCE public.discussion_report_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.discussion_report_id_seq OWNER TO d104;

--
-- TOC entry 3509 (class 0 OID 0)
-- Dependencies: 238
-- Name: discussion_report_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: d104
--

ALTER SEQUENCE public.discussion_report_id_seq OWNED BY public.discussion_reports.discussion_report_id;


--
-- TOC entry 226 (class 1259 OID 16836)
-- Name: discussions; Type: TABLE; Schema: public; Owner: d104
--

CREATE TABLE public.discussions (
    discussion_id integer NOT NULL,
    creator_id integer NOT NULL,
    deleter_id integer,
    title character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp without time zone,
    is_deleted boolean DEFAULT false NOT NULL,
    latest_content_number integer DEFAULT 1 NOT NULL,
    code_id integer NOT NULL,
    document_id bigint
);


ALTER TABLE public.discussions OWNER TO d104;

--
-- TOC entry 225 (class 1259 OID 16835)
-- Name: discussions_discussion_id_seq; Type: SEQUENCE; Schema: public; Owner: d104
--

CREATE SEQUENCE public.discussions_discussion_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.discussions_discussion_id_seq OWNER TO d104;

--
-- TOC entry 3510 (class 0 OID 0)
-- Dependencies: 225
-- Name: discussions_discussion_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: d104
--

ALTER SEQUENCE public.discussions_discussion_id_seq OWNED BY public.discussions.discussion_id;


--
-- TOC entry 234 (class 1259 OID 16976)
-- Name: document_bookmarks; Type: TABLE; Schema: public; Owner: d104
--

CREATE TABLE public.document_bookmarks (
    user_id integer NOT NULL,
    document_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.document_bookmarks OWNER TO d104;

--
-- TOC entry 224 (class 1259 OID 16811)
-- Name: document_versions; Type: TABLE; Schema: public; Owner: d104
--

CREATE TABLE public.document_versions (
    document_version_id integer NOT NULL,
    document_id integer NOT NULL,
    category_id integer NOT NULL,
    version_number integer NOT NULL,
    content text,
    content_diff text,
    edit_memo character varying(100),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    plus_count integer,
    minus_count integer,
    editor_id integer NOT NULL
);


ALTER TABLE public.document_versions OWNER TO d104;

--
-- TOC entry 223 (class 1259 OID 16810)
-- Name: document_versions_document_version_id_seq; Type: SEQUENCE; Schema: public; Owner: d104
--

CREATE SEQUENCE public.document_versions_document_version_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.document_versions_document_version_id_seq OWNER TO d104;

--
-- TOC entry 3511 (class 0 OID 0)
-- Dependencies: 223
-- Name: document_versions_document_version_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: d104
--

ALTER SEQUENCE public.document_versions_document_version_id_seq OWNED BY public.document_versions.document_version_id;


--
-- TOC entry 222 (class 1259 OID 16786)
-- Name: documents; Type: TABLE; Schema: public; Owner: d104
--

CREATE TABLE public.documents (
    document_id integer NOT NULL,
    university_id smallint,
    category_id integer NOT NULL,
    title character varying(255) NOT NULL,
    latest_version_number integer DEFAULT 1 NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp without time zone,
    is_deleted boolean DEFAULT false NOT NULL,
    delete_reason character varying(255),
    version integer NOT NULL
);


ALTER TABLE public.documents OWNER TO d104;

--
-- TOC entry 221 (class 1259 OID 16785)
-- Name: documents_document_id_seq; Type: SEQUENCE; Schema: public; Owner: d104
--

CREATE SEQUENCE public.documents_document_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.documents_document_id_seq OWNER TO d104;

--
-- TOC entry 3512 (class 0 OID 0)
-- Dependencies: 221
-- Name: documents_document_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: d104
--

ALTER SEQUENCE public.documents_document_id_seq OWNED BY public.documents.document_id;


--
-- TOC entry 210 (class 1259 OID 16716)
-- Name: regions; Type: TABLE; Schema: public; Owner: d104
--

CREATE TABLE public.regions (
    region_id integer NOT NULL,
    name character varying(20) NOT NULL
);


ALTER TABLE public.regions OWNER TO d104;

--
-- TOC entry 209 (class 1259 OID 16715)
-- Name: regions_region_id_seq; Type: SEQUENCE; Schema: public; Owner: d104
--

CREATE SEQUENCE public.regions_region_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.regions_region_id_seq OWNER TO d104;

--
-- TOC entry 3513 (class 0 OID 0)
-- Dependencies: 209
-- Name: regions_region_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: d104
--

ALTER SEQUENCE public.regions_region_id_seq OWNED BY public.regions.region_id;


--
-- TOC entry 216 (class 1259 OID 16744)
-- Name: universities; Type: TABLE; Schema: public; Owner: d104
--

CREATE TABLE public.universities (
    university_id smallint NOT NULL,
    name character varying(100) NOT NULL,
    address character varying(500),
    phone character varying(13),
    website character varying(255),
    email_domain character varying(255) NOT NULL,
    logo_url character varying(300),
    region_id integer NOT NULL
);


ALTER TABLE public.universities OWNER TO d104;

--
-- TOC entry 215 (class 1259 OID 16743)
-- Name: universities_university_id_seq; Type: SEQUENCE; Schema: public; Owner: d104
--

CREATE SEQUENCE public.universities_university_id_seq
    AS smallint
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.universities_university_id_seq OWNER TO d104;

--
-- TOC entry 3514 (class 0 OID 0)
-- Dependencies: 215
-- Name: universities_university_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: d104
--

ALTER SEQUENCE public.universities_university_id_seq OWNED BY public.universities.university_id;


--
-- TOC entry 235 (class 1259 OID 16992)
-- Name: university_bookmarks; Type: TABLE; Schema: public; Owner: d104
--

CREATE TABLE public.university_bookmarks (
    user_id integer NOT NULL,
    university_id smallint NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.university_bookmarks OWNER TO d104;

--
-- TOC entry 237 (class 1259 OID 17009)
-- Name: user_activities; Type: TABLE; Schema: public; Owner: d104
--

CREATE TABLE public.user_activities (
    activity_id integer NOT NULL,
    user_id integer NOT NULL,
    target_id integer NOT NULL,
    created_at timestamp without time zone NOT NULL,
    code_id integer NOT NULL
);


ALTER TABLE public.user_activities OWNER TO d104;

--
-- TOC entry 236 (class 1259 OID 17008)
-- Name: user_activities_activity_id_seq; Type: SEQUENCE; Schema: public; Owner: d104
--

CREATE SEQUENCE public.user_activities_activity_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_activities_activity_id_seq OWNER TO d104;

--
-- TOC entry 3515 (class 0 OID 0)
-- Dependencies: 236
-- Name: user_activities_activity_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: d104
--

ALTER SEQUENCE public.user_activities_activity_id_seq OWNED BY public.user_activities.activity_id;


--
-- TOC entry 232 (class 1259 OID 16922)
-- Name: user_bans; Type: TABLE; Schema: public; Owner: d104
--

CREATE TABLE public.user_bans (
    user_ban_id integer NOT NULL,
    user_id integer NOT NULL,
    admin_id integer NOT NULL,
    user_report_id integer,
    reason character varying(400),
    created_at timestamp without time zone,
    banned_until timestamp without time zone
);


ALTER TABLE public.user_bans OWNER TO d104;

--
-- TOC entry 231 (class 1259 OID 16921)
-- Name: user_bans_user_ban_id_seq; Type: SEQUENCE; Schema: public; Owner: d104
--

CREATE SEQUENCE public.user_bans_user_ban_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_bans_user_ban_id_seq OWNER TO d104;

--
-- TOC entry 3516 (class 0 OID 0)
-- Dependencies: 231
-- Name: user_bans_user_ban_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: d104
--

ALTER SEQUENCE public.user_bans_user_ban_id_seq OWNED BY public.user_bans.user_ban_id;


--
-- TOC entry 230 (class 1259 OID 16892)
-- Name: user_reports; Type: TABLE; Schema: public; Owner: d104
--

CREATE TABLE public.user_reports (
    user_report_id integer NOT NULL,
    reported_user_id integer NOT NULL,
    reporter_id integer NOT NULL,
    reviewer_id integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    reason character varying(400) NOT NULL,
    admin_reason character varying(200),
    reviewed_at timestamp without time zone,
    code_id integer NOT NULL
);


ALTER TABLE public.user_reports OWNER TO d104;

--
-- TOC entry 229 (class 1259 OID 16891)
-- Name: user_reports_user_report_id_seq; Type: SEQUENCE; Schema: public; Owner: d104
--

CREATE SEQUENCE public.user_reports_user_report_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_reports_user_report_id_seq OWNER TO d104;

--
-- TOC entry 3517 (class 0 OID 0)
-- Dependencies: 229
-- Name: user_reports_user_report_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: d104
--

ALTER SEQUENCE public.user_reports_user_report_id_seq OWNED BY public.user_reports.user_report_id;


--
-- TOC entry 218 (class 1259 OID 16758)
-- Name: users; Type: TABLE; Schema: public; Owner: d104
--

CREATE TABLE public.users (
    user_id integer NOT NULL,
    university_id smallint,
    email character varying(320) NOT NULL,
    password character varying(64) NOT NULL,
    nickname character varying(20) NOT NULL,
    role character varying(255) DEFAULT 'USER'::public.user_role NOT NULL,
    is_university_verified boolean DEFAULT false NOT NULL,
    last_verified_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp without time zone,
    is_deleted boolean DEFAULT false NOT NULL,
    is_push_agree boolean DEFAULT false
);


ALTER TABLE public.users OWNER TO d104;

--
-- TOC entry 217 (class 1259 OID 16757)
-- Name: users_user_id_seq; Type: SEQUENCE; Schema: public; Owner: d104
--

CREATE SEQUENCE public.users_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_user_id_seq OWNER TO d104;

--
-- TOC entry 3518 (class 0 OID 0)
-- Dependencies: 217
-- Name: users_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: d104
--

ALTER SEQUENCE public.users_user_id_seq OWNED BY public.users.user_id;


--
-- TOC entry 3260 (class 2604 OID 17130)
-- Name: categories category_id; Type: DEFAULT; Schema: public; Owner: d104
--

ALTER TABLE ONLY public.categories ALTER COLUMN category_id SET DEFAULT nextval('public.categories_category_id_seq'::regclass);


--
-- TOC entry 3248 (class 2604 OID 17270)
-- Name: code_groups code_group_id; Type: DEFAULT; Schema: public; Owner: d104
--

ALTER TABLE ONLY public.code_groups ALTER COLUMN code_group_id SET DEFAULT nextval('public.code_groups_code_group_id_seq'::regclass);


--
-- TOC entry 3250 (class 2604 OID 17282)
-- Name: codes code_id; Type: DEFAULT; Schema: public; Owner: d104
--

ALTER TABLE ONLY public.codes ALTER COLUMN code_id SET DEFAULT nextval('public.codes_code_id_seq'::regclass);


--
-- TOC entry 3273 (class 2604 OID 16870)
-- Name: discussion_contents discussion_content_id; Type: DEFAULT; Schema: public; Owner: d104
--

ALTER TABLE ONLY public.discussion_contents ALTER COLUMN discussion_content_id SET DEFAULT nextval('public.discussion_contents_discussion_content_id_seq'::regclass);


--
-- TOC entry 3279 (class 2604 OID 17427)
-- Name: discussion_reports discussion_report_id; Type: DEFAULT; Schema: public; Owner: d104
--

ALTER TABLE ONLY public.discussion_reports ALTER COLUMN discussion_report_id SET DEFAULT nextval('public.discussion_report_id_seq'::regclass);


--
-- TOC entry 3268 (class 2604 OID 16839)
-- Name: discussions discussion_id; Type: DEFAULT; Schema: public; Owner: d104
--

ALTER TABLE ONLY public.discussions ALTER COLUMN discussion_id SET DEFAULT nextval('public.discussions_discussion_id_seq'::regclass);


--
-- TOC entry 3266 (class 2604 OID 16814)
-- Name: document_versions document_version_id; Type: DEFAULT; Schema: public; Owner: d104
--

ALTER TABLE ONLY public.document_versions ALTER COLUMN document_version_id SET DEFAULT nextval('public.document_versions_document_version_id_seq'::regclass);


--
-- TOC entry 3261 (class 2604 OID 16789)
-- Name: documents document_id; Type: DEFAULT; Schema: public; Owner: d104
--

ALTER TABLE ONLY public.documents ALTER COLUMN document_id SET DEFAULT nextval('public.documents_document_id_seq'::regclass);


--
-- TOC entry 3247 (class 2604 OID 17172)
-- Name: regions region_id; Type: DEFAULT; Schema: public; Owner: d104
--

ALTER TABLE ONLY public.regions ALTER COLUMN region_id SET DEFAULT nextval('public.regions_region_id_seq'::regclass);


--
-- TOC entry 3252 (class 2604 OID 16747)
-- Name: universities university_id; Type: DEFAULT; Schema: public; Owner: d104
--

ALTER TABLE ONLY public.universities ALTER COLUMN university_id SET DEFAULT nextval('public.universities_university_id_seq'::regclass);


--
-- TOC entry 3282 (class 2604 OID 17012)
-- Name: user_activities activity_id; Type: DEFAULT; Schema: public; Owner: d104
--

ALTER TABLE ONLY public.user_activities ALTER COLUMN activity_id SET DEFAULT nextval('public.user_activities_activity_id_seq'::regclass);


--
-- TOC entry 3277 (class 2604 OID 16925)
-- Name: user_bans user_ban_id; Type: DEFAULT; Schema: public; Owner: d104
--

ALTER TABLE ONLY public.user_bans ALTER COLUMN user_ban_id SET DEFAULT nextval('public.user_bans_user_ban_id_seq'::regclass);


--
-- TOC entry 3275 (class 2604 OID 16895)
-- Name: user_reports user_report_id; Type: DEFAULT; Schema: public; Owner: d104
--

ALTER TABLE ONLY public.user_reports ALTER COLUMN user_report_id SET DEFAULT nextval('public.user_reports_user_report_id_seq'::regclass);


--
-- TOC entry 3253 (class 2604 OID 16761)
-- Name: users user_id; Type: DEFAULT; Schema: public; Owner: d104
--

ALTER TABLE ONLY public.users ALTER COLUMN user_id SET DEFAULT nextval('public.users_user_id_seq'::regclass);


--
-- TOC entry 3299 (class 2606 OID 17132)
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: d104
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (category_id);


--
-- TOC entry 3286 (class 2606 OID 17272)
-- Name: code_groups code_groups_pkey; Type: CONSTRAINT; Schema: public; Owner: d104
--

ALTER TABLE ONLY public.code_groups
    ADD CONSTRAINT code_groups_pkey PRIMARY KEY (code_group_id);


--
-- TOC entry 3288 (class 2606 OID 17284)
-- Name: codes codes_pkey; Type: CONSTRAINT; Schema: public; Owner: d104
--

ALTER TABLE ONLY public.codes
    ADD CONSTRAINT codes_pkey PRIMARY KEY (code_id);


--
-- TOC entry 3311 (class 2606 OID 16875)
-- Name: discussion_contents discussion_contents_pkey; Type: CONSTRAINT; Schema: public; Owner: d104
--

ALTER TABLE ONLY public.discussion_contents
    ADD CONSTRAINT discussion_contents_pkey PRIMARY KEY (discussion_content_id);


--
-- TOC entry 3320 (class 2606 OID 17425)
-- Name: discussion_reports discussion_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: d104
--

ALTER TABLE ONLY public.discussion_reports
    ADD CONSTRAINT discussion_reports_pkey PRIMARY KEY (discussion_report_id);


--
-- TOC entry 3309 (class 2606 OID 16845)
-- Name: discussions discussions_pkey; Type: CONSTRAINT; Schema: public; Owner: d104
--

ALTER TABLE ONLY public.discussions
    ADD CONSTRAINT discussions_pkey PRIMARY KEY (discussion_id);


--
-- TOC entry 3322 (class 2606 OID 16981)
-- Name: document_bookmarks document_bookmarks_pkey; Type: CONSTRAINT; Schema: public; Owner: d104
--

ALTER TABLE ONLY public.document_bookmarks
    ADD CONSTRAINT document_bookmarks_pkey PRIMARY KEY (user_id, document_id);


--
-- TOC entry 3306 (class 2606 OID 16819)
-- Name: document_versions document_versions_pkey; Type: CONSTRAINT; Schema: public; Owner: d104
--

ALTER TABLE ONLY public.document_versions
    ADD CONSTRAINT document_versions_pkey PRIMARY KEY (document_version_id);


--
-- TOC entry 3301 (class 2606 OID 16797)
-- Name: documents documents_pkey; Type: CONSTRAINT; Schema: public; Owner: d104
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_pkey PRIMARY KEY (document_id);


--
-- TOC entry 3303 (class 2606 OID 16799)
-- Name: documents documents_title_key; Type: CONSTRAINT; Schema: public; Owner: d104
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_title_key UNIQUE (title);


--
-- TOC entry 3284 (class 2606 OID 17174)
-- Name: regions regions_pkey; Type: CONSTRAINT; Schema: public; Owner: d104
--

ALTER TABLE ONLY public.regions
    ADD CONSTRAINT regions_pkey PRIMARY KEY (region_id);


--
-- TOC entry 3290 (class 2606 OID 16751)
-- Name: universities universities_pkey; Type: CONSTRAINT; Schema: public; Owner: d104
--

ALTER TABLE ONLY public.universities
    ADD CONSTRAINT universities_pkey PRIMARY KEY (university_id);


--
-- TOC entry 3324 (class 2606 OID 16997)
-- Name: university_bookmarks university_bookmarks_pkey; Type: CONSTRAINT; Schema: public; Owner: d104
--

ALTER TABLE ONLY public.university_bookmarks
    ADD CONSTRAINT university_bookmarks_pkey PRIMARY KEY (user_id, university_id);


--
-- TOC entry 3326 (class 2606 OID 17014)
-- Name: user_activities user_activities_pkey; Type: CONSTRAINT; Schema: public; Owner: d104
--

ALTER TABLE ONLY public.user_activities
    ADD CONSTRAINT user_activities_pkey PRIMARY KEY (activity_id);


--
-- TOC entry 3318 (class 2606 OID 16927)
-- Name: user_bans user_bans_pkey; Type: CONSTRAINT; Schema: public; Owner: d104
--

ALTER TABLE ONLY public.user_bans
    ADD CONSTRAINT user_bans_pkey PRIMARY KEY (user_ban_id);


--
-- TOC entry 3315 (class 2606 OID 16900)
-- Name: user_reports user_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: d104
--

ALTER TABLE ONLY public.user_reports
    ADD CONSTRAINT user_reports_pkey PRIMARY KEY (user_report_id);


--
-- TOC entry 3293 (class 2606 OID 16770)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: d104
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 3295 (class 2606 OID 16772)
-- Name: users users_nickname_key; Type: CONSTRAINT; Schema: public; Owner: d104
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_nickname_key UNIQUE (nickname);


--
-- TOC entry 3297 (class 2606 OID 16768)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: d104
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- TOC entry 3312 (class 1259 OID 17029)
-- Name: idx_discussion_contents_discussion; Type: INDEX; Schema: public; Owner: d104
--

CREATE INDEX idx_discussion_contents_discussion ON public.discussion_contents USING btree (discussion_id);


--
-- TOC entry 3307 (class 1259 OID 17027)
-- Name: idx_document_versions_document; Type: INDEX; Schema: public; Owner: d104
--

CREATE INDEX idx_document_versions_document ON public.document_versions USING btree (document_id);


--
-- TOC entry 3304 (class 1259 OID 17026)
-- Name: idx_documents_university; Type: INDEX; Schema: public; Owner: d104
--

CREATE INDEX idx_documents_university ON public.documents USING btree (university_id);


--
-- TOC entry 3316 (class 1259 OID 17031)
-- Name: idx_user_bans_user; Type: INDEX; Schema: public; Owner: d104
--

CREATE INDEX idx_user_bans_user ON public.user_bans USING btree (user_id);


--
-- TOC entry 3313 (class 1259 OID 17030)
-- Name: idx_user_reports_reported_user; Type: INDEX; Schema: public; Owner: d104
--

CREATE INDEX idx_user_reports_reported_user ON public.user_reports USING btree (reported_user_id);


--
-- TOC entry 3291 (class 1259 OID 17025)
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: d104
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- TOC entry 3346 (class 2606 OID 16933)
-- Name: user_bans fk_admin; Type: FK CONSTRAINT; Schema: public; Owner: d104
--

ALTER TABLE ONLY public.user_bans
    ADD CONSTRAINT fk_admin FOREIGN KEY (admin_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 3332 (class 2606 OID 17147)
-- Name: document_versions fk_category; Type: FK CONSTRAINT; Schema: public; Owner: d104
--

ALTER TABLE ONLY public.document_versions
    ADD CONSTRAINT fk_category FOREIGN KEY (category_id) REFERENCES public.categories(category_id) ON DELETE SET NULL;


--
-- TOC entry 3330 (class 2606 OID 17159)
-- Name: documents fk_category; Type: FK CONSTRAINT; Schema: public; Owner: d104
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT fk_category FOREIGN KEY (category_id) REFERENCES public.categories(category_id) ON DELETE SET NULL;


--
-- TOC entry 3358 (class 2606 OID 17323)
-- Name: user_activities fk_code; Type: FK CONSTRAINT; Schema: public; Owner: d104
--

ALTER TABLE ONLY public.user_activities
    ADD CONSTRAINT fk_code FOREIGN KEY (code_id) REFERENCES public.codes(code_id) ON DELETE CASCADE;


--
-- TOC entry 3342 (class 2606 OID 17332)
-- Name: user_reports fk_code; Type: FK CONSTRAINT; Schema: public; Owner: d104
--

ALTER TABLE ONLY public.user_reports
    ADD CONSTRAINT fk_code FOREIGN KEY (code_id) REFERENCES public.codes(code_id) ON DELETE CASCADE;


--
-- TOC entry 3339 (class 2606 OID 17376)
-- Name: discussion_contents fk_code; Type: FK CONSTRAINT; Schema: public; Owner: d104
--

ALTER TABLE ONLY public.discussion_contents
    ADD CONSTRAINT fk_code FOREIGN KEY (code_id) REFERENCES public.codes(code_id) ON DELETE CASCADE;


--
-- TOC entry 3349 (class 2606 OID 17388)
-- Name: discussion_reports fk_code; Type: FK CONSTRAINT; Schema: public; Owner: d104
--

ALTER TABLE ONLY public.discussion_reports
    ADD CONSTRAINT fk_code FOREIGN KEY (code_id) REFERENCES public.codes(code_id) ON DELETE CASCADE;


--
-- TOC entry 3335 (class 2606 OID 17399)
-- Name: discussions fk_code; Type: FK CONSTRAINT; Schema: public; Owner: d104
--

ALTER TABLE ONLY public.discussions
    ADD CONSTRAINT fk_code FOREIGN KEY (code_id) REFERENCES public.codes(code_id) ON DELETE CASCADE;


--
-- TOC entry 3327 (class 2606 OID 17314)
-- Name: codes fk_code_group; Type: FK CONSTRAINT; Schema: public; Owner: d104
--

ALTER TABLE ONLY public.codes
    ADD CONSTRAINT fk_code_group FOREIGN KEY (code_group_id) REFERENCES public.code_groups(code_group_id) ON DELETE CASCADE;


--
-- TOC entry 3336 (class 2606 OID 16851)
-- Name: discussions fk_creator; Type: FK CONSTRAINT; Schema: public; Owner: d104
--

ALTER TABLE ONLY public.discussions
    ADD CONSTRAINT fk_creator FOREIGN KEY (creator_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 3340 (class 2606 OID 16881)
-- Name: discussion_contents fk_creator; Type: FK CONSTRAINT; Schema: public; Owner: d104
--

ALTER TABLE ONLY public.discussion_contents
    ADD CONSTRAINT fk_creator FOREIGN KEY (creator_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 3337 (class 2606 OID 16856)
-- Name: discussions fk_deleter; Type: FK CONSTRAINT; Schema: public; Owner: d104
--

ALTER TABLE ONLY public.discussions
    ADD CONSTRAINT fk_deleter FOREIGN KEY (deleter_id) REFERENCES public.users(user_id) ON DELETE SET NULL;


--
-- TOC entry 3341 (class 2606 OID 16876)
-- Name: discussion_contents fk_discussion; Type: FK CONSTRAINT; Schema: public; Owner: d104
--

ALTER TABLE ONLY public.discussion_contents
    ADD CONSTRAINT fk_discussion FOREIGN KEY (discussion_id) REFERENCES public.discussions(discussion_id) ON DELETE CASCADE;


--
-- TOC entry 3350 (class 2606 OID 16951)
-- Name: discussion_reports fk_discussion_content; Type: FK CONSTRAINT; Schema: public; Owner: d104
--

ALTER TABLE ONLY public.discussion_reports
    ADD CONSTRAINT fk_discussion_content FOREIGN KEY (discussion_content_id) REFERENCES public.discussion_contents(discussion_content_id) ON DELETE CASCADE;


--
-- TOC entry 3333 (class 2606 OID 16820)
-- Name: document_versions fk_document; Type: FK CONSTRAINT; Schema: public; Owner: d104
--

ALTER TABLE ONLY public.document_versions
    ADD CONSTRAINT fk_document FOREIGN KEY (document_id) REFERENCES public.documents(document_id) ON DELETE CASCADE;


--
-- TOC entry 3354 (class 2606 OID 16987)
-- Name: document_bookmarks fk_document; Type: FK CONSTRAINT; Schema: public; Owner: d104
--

ALTER TABLE ONLY public.document_bookmarks
    ADD CONSTRAINT fk_document FOREIGN KEY (document_id) REFERENCES public.documents(document_id) ON DELETE CASCADE;


--
-- TOC entry 3338 (class 2606 OID 17050)
-- Name: discussions fk_documents; Type: FK CONSTRAINT; Schema: public; Owner: d104
--

ALTER TABLE ONLY public.discussions
    ADD CONSTRAINT fk_documents FOREIGN KEY (document_id) REFERENCES public.documents(document_id) ON DELETE CASCADE;


--
-- TOC entry 3334 (class 2606 OID 17044)
-- Name: document_versions fk_editor; Type: FK CONSTRAINT; Schema: public; Owner: d104
--

ALTER TABLE ONLY public.document_versions
    ADD CONSTRAINT fk_editor FOREIGN KEY (editor_id) REFERENCES public.users(user_id);


--
-- TOC entry 3328 (class 2606 OID 17184)
-- Name: universities fk_region; Type: FK CONSTRAINT; Schema: public; Owner: d104
--

ALTER TABLE ONLY public.universities
    ADD CONSTRAINT fk_region FOREIGN KEY (region_id) REFERENCES public.regions(region_id) ON DELETE CASCADE;


--
-- TOC entry 3351 (class 2606 OID 16961)
-- Name: discussion_reports fk_reported; Type: FK CONSTRAINT; Schema: public; Owner: d104
--

ALTER TABLE ONLY public.discussion_reports
    ADD CONSTRAINT fk_reported FOREIGN KEY (reported_user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 3343 (class 2606 OID 16901)
-- Name: user_reports fk_reported_user; Type: FK CONSTRAINT; Schema: public; Owner: d104
--

ALTER TABLE ONLY public.user_reports
    ADD CONSTRAINT fk_reported_user FOREIGN KEY (reported_user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 3344 (class 2606 OID 16906)
-- Name: user_reports fk_reporter; Type: FK CONSTRAINT; Schema: public; Owner: d104
--

ALTER TABLE ONLY public.user_reports
    ADD CONSTRAINT fk_reporter FOREIGN KEY (reporter_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 3352 (class 2606 OID 16956)
-- Name: discussion_reports fk_reporter; Type: FK CONSTRAINT; Schema: public; Owner: d104
--

ALTER TABLE ONLY public.discussion_reports
    ADD CONSTRAINT fk_reporter FOREIGN KEY (reporter_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 3345 (class 2606 OID 16911)
-- Name: user_reports fk_reviewer; Type: FK CONSTRAINT; Schema: public; Owner: d104
--

ALTER TABLE ONLY public.user_reports
    ADD CONSTRAINT fk_reviewer FOREIGN KEY (reviewer_id) REFERENCES public.users(user_id) ON DELETE SET NULL;


--
-- TOC entry 3353 (class 2606 OID 16966)
-- Name: discussion_reports fk_reviewer; Type: FK CONSTRAINT; Schema: public; Owner: d104
--

ALTER TABLE ONLY public.discussion_reports
    ADD CONSTRAINT fk_reviewer FOREIGN KEY (reviewer_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 3329 (class 2606 OID 16773)
-- Name: users fk_university; Type: FK CONSTRAINT; Schema: public; Owner: d104
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT fk_university FOREIGN KEY (university_id) REFERENCES public.universities(university_id) ON DELETE SET NULL;


--
-- TOC entry 3331 (class 2606 OID 16800)
-- Name: documents fk_university; Type: FK CONSTRAINT; Schema: public; Owner: d104
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT fk_university FOREIGN KEY (university_id) REFERENCES public.universities(university_id) ON DELETE SET NULL;


--
-- TOC entry 3356 (class 2606 OID 17003)
-- Name: university_bookmarks fk_university; Type: FK CONSTRAINT; Schema: public; Owner: d104
--

ALTER TABLE ONLY public.university_bookmarks
    ADD CONSTRAINT fk_university FOREIGN KEY (university_id) REFERENCES public.universities(university_id) ON DELETE CASCADE;


--
-- TOC entry 3347 (class 2606 OID 16928)
-- Name: user_bans fk_user; Type: FK CONSTRAINT; Schema: public; Owner: d104
--

ALTER TABLE ONLY public.user_bans
    ADD CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 3355 (class 2606 OID 16982)
-- Name: document_bookmarks fk_user; Type: FK CONSTRAINT; Schema: public; Owner: d104
--

ALTER TABLE ONLY public.document_bookmarks
    ADD CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 3357 (class 2606 OID 16998)
-- Name: university_bookmarks fk_user; Type: FK CONSTRAINT; Schema: public; Owner: d104
--

ALTER TABLE ONLY public.university_bookmarks
    ADD CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 3359 (class 2606 OID 17015)
-- Name: user_activities fk_user; Type: FK CONSTRAINT; Schema: public; Owner: d104
--

ALTER TABLE ONLY public.user_activities
    ADD CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 3348 (class 2606 OID 16938)
-- Name: user_bans fk_user_report; Type: FK CONSTRAINT; Schema: public; Owner: d104
--

ALTER TABLE ONLY public.user_bans
    ADD CONSTRAINT fk_user_report FOREIGN KEY (user_report_id) REFERENCES public.user_reports(user_report_id) ON DELETE SET NULL;


--
-- TOC entry 3504 (class 0 OID 0)
-- Dependencies: 4
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;
GRANT ALL ON SCHEMA public TO PUBLIC;


-- Completed on 2025-11-20 09:18:54

--
-- PostgreSQL database dump complete
--

\unrestrict WFXqyP313MZo7fHRtWvuq7MrjbUvoLIq26BiZUojNMGIdQ8bbUZLiVEluUkaOHX

