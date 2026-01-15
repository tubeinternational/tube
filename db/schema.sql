--
-- PostgreSQL database dump
--

\restrict jSRezPWyEY688GJ6NUSiuADVeBOUwUbKxrL4p1N2NxMe1FydsromNTyQ3MzHCJc

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

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
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email text NOT NULL,
    password_hash text NOT NULL,
    role text NOT NULL,
    is_active boolean DEFAULT true,
    two_factor_enabled boolean DEFAULT true,
    otp_hash text,
    otp_expires_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT users_role_check CHECK ((role = 'ADMIN'::text))
);


--
-- Name: video_categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.video_categories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(100) NOT NULL,
    slug character varying(120) NOT NULL,
    image_path text,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: video_likes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.video_likes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    video_id uuid NOT NULL,
    user_id uuid,
    created_at timestamp without time zone DEFAULT now(),
    guest_hash text
);


--
-- Name: videos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.videos (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    description text,
    video_url text,
    thumbnail_url text,
    duration integer,
    views integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    category text,
    country character varying(100) NOT NULL,
    storage_type character varying(20) DEFAULT 'local'::character varying,
    playback_policy character varying(20) DEFAULT 'signed'::character varying,
    source_type text,
    external_video_url text,
    slug character varying(255),
    meta_title character varying(255),
    meta_description text,
    focus_keywords text[],
    video_type character varying(10) DEFAULT 'normal'::character varying,
    CONSTRAINT video_source_check CHECK (((((storage_type)::text = 'local'::text) AND (video_url IS NOT NULL)) OR (((storage_type)::text = 'cloudflare'::text) AND (video_url IS NOT NULL))))
);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: video_categories video_categories_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.video_categories
    ADD CONSTRAINT video_categories_name_key UNIQUE (name);


--
-- Name: video_categories video_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.video_categories
    ADD CONSTRAINT video_categories_pkey PRIMARY KEY (id);


--
-- Name: video_categories video_categories_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.video_categories
    ADD CONSTRAINT video_categories_slug_key UNIQUE (slug);


--
-- Name: video_likes video_likes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.video_likes
    ADD CONSTRAINT video_likes_pkey PRIMARY KEY (id);


--
-- Name: video_likes video_likes_video_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.video_likes
    ADD CONSTRAINT video_likes_video_id_user_id_key UNIQUE (video_id, user_id);


--
-- Name: videos videos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.videos
    ADD CONSTRAINT videos_pkey PRIMARY KEY (id);


--
-- Name: videos videos_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.videos
    ADD CONSTRAINT videos_slug_key UNIQUE (slug);


--
-- Name: uniq_video_guest_like; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX uniq_video_guest_like ON public.video_likes USING btree (video_id, guest_hash) WHERE (guest_hash IS NOT NULL);


--
-- Name: uniq_video_user_like; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX uniq_video_user_like ON public.video_likes USING btree (video_id, user_id) WHERE (user_id IS NOT NULL);


--
-- Name: video_likes video_likes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.video_likes
    ADD CONSTRAINT video_likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: video_likes video_likes_video_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.video_likes
    ADD CONSTRAINT video_likes_video_id_fkey FOREIGN KEY (video_id) REFERENCES public.videos(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict jSRezPWyEY688GJ6NUSiuADVeBOUwUbKxrL4p1N2NxMe1FydsromNTyQ3MzHCJc

