--
-- PostgreSQL database dump
--

-- Baseline on 5 Nov, 2025
-- Up until 20251030103412 ( Add FK foreign keys for qr_generator and manual_payment to haravan_orders)

-- Dumped from database version 16.9 (02a153c)
-- Dumped by pg_dump version 16.10

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
-- Name: timescaledb; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS timescaledb WITH SCHEMA public;

--
-- Name: EXTENSION timescaledb; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION timescaledb IS 'Enables scalable inserts and complex queries for time-series data (Apache 2 Edition)';


--
-- Name: advertising_cost; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA IF NOT EXISTS advertising_cost;


--
-- Name: bizflycrm; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA IF NOT EXISTS bizflycrm;


--
-- Name: conversation_rate; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA IF NOT EXISTS conversation_rate;


--
-- Name: crm_dashboard; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA IF NOT EXISTS crm_dashboard;


--
-- Name: dashboard_reporting; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA IF NOT EXISTS dashboard_reporting;


--
-- Name: data_2024; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA IF NOT EXISTS data_2024;


--
-- Name: ecom; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA IF NOT EXISTS ecom;


--
-- Name: ecommerce; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA IF NOT EXISTS ecommerce;


--
-- Name: erpnext; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA IF NOT EXISTS erpnext;


--
-- Name: gia; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA IF NOT EXISTS gia;


--
-- Name: haravan; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA IF NOT EXISTS haravan;


--
-- Name: inventory; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA IF NOT EXISTS inventory;


--
-- Name: inventory_cms; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA IF NOT EXISTS inventory_cms;


--
-- Name: inventory_report; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA IF NOT EXISTS inventory_report;


--
-- Name: jemmia; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA IF NOT EXISTS jemmia;


--
-- Name: larksuite; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA IF NOT EXISTS larksuite;


--
-- Name: market_data; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA IF NOT EXISTS market_data;


--
-- Name: misa; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA IF NOT EXISTS misa;


--
-- Name: pancake; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA IF NOT EXISTS pancake;


--
-- Name: payment; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA IF NOT EXISTS payment;


--
-- Name: policy; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA IF NOT EXISTS policy;


--
-- Name: promotion; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA IF NOT EXISTS promotion;


--
-- Name: rapnet; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA IF NOT EXISTS rapnet;


--
-- Name: reporting; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA IF NOT EXISTS reporting;


--
-- Name: salesaya; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA IF NOT EXISTS salesaya;


--
-- Name: supplychain; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA IF NOT EXISTS supplychain;


--
-- Name: workplace; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA IF NOT EXISTS workplace;


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA rapnet;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: vector; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA salesaya;


--
-- Name: EXTENSION vector; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION vector IS 'vector data type and ivfflat and hnsw access methods';


--
-- Name: get_real_created_at(integer); Type: FUNCTION; Schema: haravan; Owner: -
--

CREATE FUNCTION haravan.get_real_created_at(order_id_input integer) RETURNS timestamp without time zone
    LANGUAGE plpgsql
    AS $$
DECLARE
    current_order_id INT := order_id_input;
    current_created_at TIMESTAMP;
    ref_order_id INT;
BEGIN
    -- Lấy thông tin của đơn hàng hiện tại
    SELECT ho.created_at, ho.ref_order_id INTO current_created_at, ref_order_id
    FROM haravan.orders as ho
    WHERE ho.id = current_order_id;

    -- Vòng lặp: tiếp tục truy ngược khi có ref_order_id
    WHILE ref_order_id != 0  LOOP
        -- Cập nhật current_order_id để kiểm tra bản ghi trước đó
        current_order_id := ref_order_id;

        -- Lấy thông tin của bản ghi trước đó (cha)
        SELECT ho.created_at, ho.ref_order_id INTO current_created_at, ref_order_id
        FROM haravan.orders as ho
        WHERE ho.id = current_order_id;  -- Chỉnh sửa ở đây để lấy bản ghi trước đó
    END LOOP;

    -- Trả về created_at của bản ghi gốc
    RETURN current_created_at;
END;
$$;


--
-- Name: prevent_design_id_update(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.prevent_design_id_update() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Allow updates if the current design_id is NULL
    IF OLD.design_id IS NOT NULL AND NEW.design_id IS DISTINCT FROM OLD.design_id THEN
        RAISE EXCEPTION 'Updating design_id is not allowed unless it is currently NULL';
    END IF;
    RETURN NEW;
END;
$$;


--
-- Name: prevent_product_id_update(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.prevent_product_id_update() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Allow updates if the current product_id is NULL
    IF OLD.product_id IS NOT NULL AND NEW.product_id IS DISTINCT FROM OLD.product_id THEN
        RAISE EXCEPTION 'Updating product_id is not allowed unless it is currently NULL';
    END IF;
    RETURN NEW;
END;
$$;


--
-- Name: search_in_public_schema(text, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.search_in_public_schema(search_term text, max_results integer DEFAULT NULL::integer) RETURNS TABLE(found_table text, found_column text, found_value text)
    LANGUAGE plpgsql
    AS $$
DECLARE
    query text;
    current_table record;
    current_column record;
BEGIN
    FOR current_table IN SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE' LOOP
        FOR current_column IN SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = current_table.table_name AND data_type IN ('text', 'character varying', 'character', 'varchar') LOOP
            BEGIN
                query := format('SELECT %L::text as found_table, %L::text as found_column, LEFT(CAST(%I AS text), 200) as found_value FROM public.%I WHERE CAST(%I AS text) ILIKE %L',
                    current_table.table_name, current_column.column_name, current_column.column_name, current_table.table_name, current_column.column_name, '%' || search_term || '%');
                RETURN QUERY EXECUTE query;
            EXCEPTION WHEN OTHERS THEN NULL; END;
        END LOOP;
    END LOOP;
END;
$$;


--
-- Name: update_database_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_database_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.database_updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;


--
-- Name: update_database_updated_at_column(); Type: FUNCTION; Schema: salesaya; Owner: -
--

CREATE FUNCTION salesaya.update_database_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.database_updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;


--
-- Name: update_timestamp(); Type: FUNCTION; Schema: salesaya; Owner: -
--

CREATE FUNCTION salesaya.update_timestamp() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


--
-- Name: classify_melee_type(); Type: FUNCTION; Schema: supplychain; Owner: -
--

CREATE FUNCTION supplychain.classify_melee_type() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  total_qty INTEGER;
  non_melee_qty INTEGER;
  real_melee_qty INTEGER;
BEGIN
  IF NEW.get_melee_status = 'Success' THEN

    -- 1. Tổng số lượng tất cả melee (mọi hình, kích thước)
    SELECT COALESCE(SUM(melee_number), 0)
    INTO total_qty
    FROM supplychain.design_melee
    WHERE design_id = NEW.id;

    -- 2. Số lượng kim cương "lớn" (Round và length >= 3.6)
    SELECT COALESCE(SUM(melee_number), 0)
    INTO non_melee_qty
    FROM supplychain.design_melee
    WHERE design_id = NEW.id
      AND shape = 'Round'
      AND length >= 3.6;

    -- 3. Tính số viên tấm thực sự
    real_melee_qty := total_qty - non_melee_qty;

    -- 4. Phân loại melee_type
    UPDATE supplychain.designs
    SET melee_type = CASE
                      WHEN real_melee_qty = 0 THEN 'No melee'
                      ELSE 'Has melee'
                    END
    WHERE id = NEW.id;

  ELSE
    -- Nếu status không phải 'Success', reset melee_type về NULL
    UPDATE supplychain.designs
    SET melee_type = NULL
    WHERE id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$;


--
-- Name: generate_md5_hash(text); Type: FUNCTION; Schema: supplychain; Owner: -
--

CREATE FUNCTION supplychain.generate_md5_hash(input_value text) RETURNS text
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN MD5(input_value);
END;
$$;


--
-- Name: set_created_at(); Type: FUNCTION; Schema: supplychain; Owner: -
--

CREATE FUNCTION supplychain.set_created_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.database_created_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;


--
-- Name: set_database_created_at(); Type: FUNCTION; Schema: supplychain; Owner: -
--

CREATE FUNCTION supplychain.set_database_created_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.database_created_at := NOW();
    RETURN NEW;
END;
$$;


--
-- Name: set_database_updated_at(); Type: FUNCTION; Schema: supplychain; Owner: -
--

CREATE FUNCTION supplychain.set_database_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.database_updated_at := NOW();
    RETURN NEW;
END;
$$;


--
-- Name: set_updated_at(); Type: FUNCTION; Schema: supplychain; Owner: -
--

CREATE FUNCTION supplychain.set_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Cập nhật theo múi giờ UTC+7 (Asia/Ho_Chi_Minh)
    NEW.db_update_at := (CURRENT_TIMESTAMP AT TIME ZONE 'UTC' + INTERVAL '7 hours');
    RETURN NEW;
END;
$$;


--
-- Name: sync_designs_from_workplace(); Type: FUNCTION; Schema: supplychain; Owner: -
--

CREATE FUNCTION supplychain.sync_designs_from_workplace() RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
    row_count INTEGER;
BEGIN
    WITH upsert AS (
        INSERT INTO supplychain.designs (
            id, code, erp_code, backup_code, design_type, gender, design_year, design_seq,
            usage_status, link_4view, folder_summary, link_3d, link_render, link_retouch,
            ring_band_type, ring_band_style, ring_head_style, jewelry_rd_style,
            shape_of_main_stone, product_line, social_post, website, "RENDER", "RETOUCH",
            gold_weight, main_stone, stone_quantity, stone_weight, diamond_holder, source,
            variant_number, collections_id, image_4view, image_render, image_retouch,
            created_by, updated_by, database_created_at, database_updated_at,
            collection_name, auto_create_folder, design_code, ecom_showed, tag,
            stock_locations, wedding_ring_id, reference_code, design_status,
            erp_code_duplicated, max_seq, last_synced_render, last_synced_4view
        )
        SELECT
            id, code, erp_code, backup_code, design_type, gender, design_year, design_seq,
            usage_status, link_4view, folder_summary, link_3d, link_render, link_retouch,
            ring_band_type, ring_band_style, ring_head_style, jewelry_rd_style,
            shape_of_main_stone, product_line, social_post, website, "RENDER", "RETOUCH",
            gold_weight, main_stone, stone_quantity, stone_weight, diamond_holder, source,
            variant_number, collections_id, image_4view, image_render, image_retouch,
            created_by, updated_by, database_created_at, database_updated_at,
            collection_name, auto_create_folder, design_code, ecom_showed, tag,
            stock_locations, wedding_ring_id, reference_code, design_status,
            erp_code_duplicated, max_seq, last_synced_render, last_synced_4view
        FROM workplace.designs
        WHERE database_updated_at >= now() - interval '5 hours'
        ON CONFLICT (id) DO UPDATE SET
            code = EXCLUDED.code,
            erp_code = EXCLUDED.erp_code,
            backup_code = EXCLUDED.backup_code,
            design_type = EXCLUDED.design_type,
            gender = EXCLUDED.gender,
            design_year = EXCLUDED.design_year,
            design_seq = EXCLUDED.design_seq,
            usage_status = EXCLUDED.usage_status,
            link_4view = EXCLUDED.link_4view,
            folder_summary = EXCLUDED.folder_summary,
            link_3d = EXCLUDED.link_3d,
            link_render = EXCLUDED.link_render,
            link_retouch = EXCLUDED.link_retouch,
            ring_band_type = EXCLUDED.ring_band_type,
            ring_band_style = EXCLUDED.ring_band_style,
            ring_head_style = EXCLUDED.ring_head_style,
            jewelry_rd_style = EXCLUDED.jewelry_rd_style,
            shape_of_main_stone = EXCLUDED.shape_of_main_stone,
            product_line = EXCLUDED.product_line,
            social_post = EXCLUDED.social_post,
            website = EXCLUDED.website,
            "RENDER" = EXCLUDED."RENDER",
            "RETOUCH" = EXCLUDED."RETOUCH",
            gold_weight = EXCLUDED.gold_weight,
            main_stone = EXCLUDED.main_stone,
            stone_quantity = EXCLUDED.stone_quantity,
            stone_weight = EXCLUDED.stone_weight,
            diamond_holder = EXCLUDED.diamond_holder,
            source = EXCLUDED.source,
            variant_number = EXCLUDED.variant_number,
            collections_id = EXCLUDED.collections_id,
            image_4view = EXCLUDED.image_4view,
            image_render = EXCLUDED.image_render,
            image_retouch = EXCLUDED.image_retouch,
            created_by = EXCLUDED.created_by,
            updated_by = EXCLUDED.updated_by,
            database_created_at = EXCLUDED.database_created_at,
            database_updated_at = EXCLUDED.database_updated_at,
            collection_name = EXCLUDED.collection_name,
            auto_create_folder = EXCLUDED.auto_create_folder,
            design_code = EXCLUDED.design_code,
            ecom_showed = EXCLUDED.ecom_showed,
            tag = EXCLUDED.tag,
            stock_locations = EXCLUDED.stock_locations,
            wedding_ring_id = EXCLUDED.wedding_ring_id,
            reference_code = EXCLUDED.reference_code,
            design_status = EXCLUDED.design_status,
            erp_code_duplicated = EXCLUDED.erp_code_duplicated,
            max_seq = EXCLUDED.max_seq,
            last_synced_render = EXCLUDED.last_synced_render,
            last_synced_4view = EXCLUDED.last_synced_4view
        RETURNING id
    )
    SELECT COUNT(*) INTO row_count FROM upsert;

    -- Trả về chuỗi thông báo
    RETURN format('✅ Đã update được %s dòng dữ liệu.', row_count);
END;
$$;


--
-- Name: trg_update_melee_type_timestamp(); Type: FUNCTION; Schema: supplychain; Owner: -
--

CREATE FUNCTION supplychain.trg_update_melee_type_timestamp() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Kiểm tra nếu melee_type bị thay đổi
    IF NEW.melee_type IS DISTINCT FROM OLD.melee_type THEN
        NEW.melee_type_update_at := NOW();
    END IF;
    RETURN NEW;
END;
$$;


--
-- Name: update_jewelry_purchase_order_hash_order_product_id(); Type: FUNCTION; Schema: supplychain; Owner: -
--

CREATE FUNCTION supplychain.update_jewelry_purchase_order_hash_order_product_id() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  -- Kiểm tra nếu cột order_product_id thay đổi
  IF NEW.order_product_id IS DISTINCT FROM OLD.order_product_id THEN
    NEW.hash_order_product_id := generate_md5_hash(NEW.order_product_id);  -- Tính hash cho order_product_id
  END IF;

  -- Trả về dòng đã được thay đổi
  RETURN NEW;
END;
$$;


--
-- Name: update_jewelry_purchase_order_hash_record_id(); Type: FUNCTION; Schema: supplychain; Owner: -
--

CREATE FUNCTION supplychain.update_jewelry_purchase_order_hash_record_id() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  -- Kiểm tra nếu cột sku_id thay đổi
  IF NEW.record_id IS DISTINCT FROM OLD.record_id THEN
    NEW.hash_record_id := generate_md5_hash(NEW.record_id);  -- Tính hash cho sku_id
  END IF;

  -- Trả về dòng đã được thay đổi
  RETURN NEW;
END;
$$;


--
-- Name: update_jewelry_purchase_order_line_items_hash_order_product_id(); Type: FUNCTION; Schema: supplychain; Owner: -
--

CREATE FUNCTION supplychain.update_jewelry_purchase_order_line_items_hash_order_product_id() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  -- Trường hợp INSERT: OLD là NULL, nên ta chỉ cần check NEW
  IF TG_OP = 'INSERT' THEN
    IF NEW.order_product_id IS NOT NULL THEN
      NEW.hash_order_product_id := supplychain.generate_md5_hash(NEW.order_product_id);
    END IF;

  -- Trường hợp UPDATE: so sánh NEW vs OLD
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.order_product_id IS DISTINCT FROM OLD.order_product_id THEN
      NEW.hash_order_product_id := supplychain.generate_md5_hash(NEW.order_product_id);
    END IF;
  END IF;

  RETURN NEW;
END;
$$;


--
-- Name: update_jewelry_purchase_order_line_items_hash_sku_id(); Type: FUNCTION; Schema: supplychain; Owner: -
--

CREATE FUNCTION supplychain.update_jewelry_purchase_order_line_items_hash_sku_id() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  -- Trường hợp INSERT
  IF TG_OP = 'INSERT' THEN
    IF NEW.sku_id IS NOT NULL THEN
      NEW.hash_sku_id := supplychain.generate_md5_hash(NEW.sku_id);
    END IF;

  -- Trường hợp UPDATE
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.sku_id IS DISTINCT FROM OLD.sku_id THEN
      NEW.hash_sku_id := supplychain.generate_md5_hash(NEW.sku_id);
    END IF;
  END IF;

  RETURN NEW;
END;
$$;


--
-- Name: update_link_4view_timestamp(); Type: FUNCTION; Schema: supplychain; Owner: -
--

CREATE FUNCTION supplychain.update_link_4view_timestamp() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  -- Chỉ cập nhật khi giá trị link_4view thay đổi từ NULL sang KHÔNG NULL
  IF NEW.link_4view IS NOT NULL AND OLD.link_4view IS NULL THEN
    NEW.database_updated_link_4view_at := now();
  END IF;

  RETURN NEW;
END;
$$;


--
-- Name: insert_design_id_into_design_details(); Type: FUNCTION; Schema: workplace; Owner: -
--

CREATE FUNCTION workplace.insert_design_id_into_design_details() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Insert a new record into the workplace.design_details table with the new design_id
    INSERT INTO workplace.design_details (design_id)
    VALUES (NEW.id); -- The default values for gold_weight and labour_cost will be used

    RETURN NEW;
END;
$$;


--
-- Name: prevent_archived_update(); Type: FUNCTION; Schema: workplace; Owner: -
--

CREATE FUNCTION workplace.prevent_archived_update() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF OLD.design_status = 'archived' AND (NEW.design_status <> 'archived' OR NEW.design_status IS NULL) THEN
        RAISE EXCEPTION 'Cannot change design_status from archived to another value';
    END IF;
    RETURN NEW;
END;
$$;


--
-- Name: prevent_design_code_attributes_update_on_designs(); Type: FUNCTION; Schema: workplace; Owner: -
--

CREATE FUNCTION workplace.prevent_design_code_attributes_update_on_designs() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF EXISTS (SELECT 1 FROM workplace.products WHERE design_id = NEW.id) THEN
        IF NEW.design_type <> OLD.design_type OR
           NEW.gender <> OLD.gender OR
           NEW.design_year <> OLD.design_year OR
           NEW.design_seq <> OLD.design_seq OR
           NEW.source <> OLD.source OR
           NEW.variant_number <> OLD.variant_number OR
           NEW.diamond_holder <> OLD.diamond_holder OR
			NEW.design_type IS NULL OR
			NEW.gender IS NULL OR
			NEW.design_year IS NULL OR
			NEW.source IS NULL OR
			NEW.design_seq IS NULL OR
			NEW.variant_number IS NULL OR
			NEW.diamond_holder IS NULL THEN
            RAISE EXCEPTION 'Update is not allowed on these columns for designs where id exists in products.';
        END IF;
    END IF;
    RETURN NEW; -- Allow the update if conditions are met
END;
$$;


--
-- Name: prevent_design_details_deletion(); Type: FUNCTION; Schema: workplace; Owner: -
--

CREATE FUNCTION workplace.prevent_design_details_deletion() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    RAISE EXCEPTION 'Deleting records from design_details is not allowed';
    RETURN NULL;
END;
$$;


--
-- Name: prevent_design_id_update(); Type: FUNCTION; Schema: workplace; Owner: -
--

CREATE FUNCTION workplace.prevent_design_id_update() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Chỉ kiểm tra nếu OLD.design_id khác null
    IF OLD.design_id IS NOT NULL THEN
        -- Kiểm tra xem design_id có thay đổi không
        IF NEW.design_id IS DISTINCT FROM OLD.design_id THEN
            RAISE EXCEPTION 'Updating design_id is not allowed';
        END IF;
    END IF;
    RETURN NEW;
END;
$$;


--
-- Name: prevent_update_barcode(); Type: FUNCTION; Schema: workplace; Owner: -
--

CREATE FUNCTION workplace.prevent_update_barcode() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
	IF (OLD.barcode IS NOT NULL AND NEW.barcode IS DISTINCT FROM OLD.barcode) THEN
		RAISE EXCEPTION 'barcode is not allowed to be updated!';
	END IF;
	RETURN NEW;
END;
$$;


--
-- Name: prevent_update_final_encoded_barcode(); Type: FUNCTION; Schema: workplace; Owner: -
--

CREATE FUNCTION workplace.prevent_update_final_encoded_barcode() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
--	IF (OLD.final_encoded_barcode IS NOT NULL AND NEW.final_encoded_barcode IS DISTINCT FROM OLD.final_encoded_barcode) THEN
--		RAISE EXCEPTION 'final_encoded_barcode is not allowed to be updated!';
--	END IF;
	RETURN NEW;
END;
$$;


--
-- Name: prevent_update_serial_number(); Type: FUNCTION; Schema: workplace; Owner: -
--

CREATE FUNCTION workplace.prevent_update_serial_number() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
	IF (OLD.serial_number IS NOT NULL AND NEW.serial_number IS DISTINCT FROM OLD.serial_number) THEN
		RAISE EXCEPTION 'serial_number is not allowed to be updated!';
	END IF;
	RETURN NEW;
END;
$$;


--
-- Name: prevent_update_sku_attribtes(); Type: FUNCTION; Schema: workplace; Owner: -
--

CREATE FUNCTION workplace.prevent_update_sku_attribtes() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
	IF OLD.sku IS NOT NULL THEN
		IF 	(OLD.product_id IS NOT NULL AND OLD.product_id <> NEW.product_id) OR
			(OLD.category IS NOT NULL AND OLD.category <> NEW.category) OR
			(OLD.applique_material IS NOT NULL AND OLD.applique_material <> NEW.applique_material) OR
			(OLD.fineness IS NOT NULL AND OLD.fineness <> NEW.fineness) OR
			(OLD.material_color IS NOT NULL AND OLD.material_color <> NEW.material_color) OR
			(OLD.size_type IS NOT NULL AND OLD.size_type <> NEW.size_type) OR
			(OLD.ring_size IS NOT NULL AND OLD.ring_size <> NEW.ring_size) THEN
				RAISE EXCEPTION 'Update to column(s) not allowed when they are NOT NULL';
		END IF;
	END IF;
	RETURN NEW;
END;
$$;


--
-- Name: prevent_update_variant_id(); Type: FUNCTION; Schema: workplace; Owner: -
--

CREATE FUNCTION workplace.prevent_update_variant_id() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
	IF OLD.variant_id IS NULL THEN
		RETURN NEW;
	END IF;
	IF OLD.variant_id IS NOT NULL AND NEW.variant_id IS DISTINCT FROM OLD.variant_id THEN
		RAISE EXCEPTION 'variant_id is not allowed to be updated!';
	END IF;
	RETURN NEW;
END;
$$;


--
-- Name: prevent_update_variant_serial_id(); Type: FUNCTION; Schema: workplace; Owner: -
--

CREATE FUNCTION workplace.prevent_update_variant_serial_id() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
--	IF (NEW.variant_serial_id is null) then
--		RAISE EXCEPTION 'barcode is not allowed to be updated!';
--	END IF;
--	IF (OLD.variant_serial_id IS NOT NULL AND NEW.variant_serial_id IS DISTINCT FROM OLD.variant_serial_id) THEN
--		RAISE EXCEPTION 'barcode is not allowed to be updated!';
--	END IF;
	RETURN NEW;
END;
$$;


--
-- Name: set_serial_number(); Type: FUNCTION; Schema: workplace; Owner: -
--

CREATE FUNCTION workplace.set_serial_number() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    current_year_month TEXT;
    max_serial TEXT;
    next_serial INTEGER;
    serial_number TEXT;
BEGIN
    -- Compute the current year and month in YYMM format
    current_year_month := TO_CHAR(NOW(), 'YYMM');

    -- Get the maximum serial number for the current year and month
    SELECT MAX(vs.serial_number) INTO max_serial
    FROM workplace.variant_serials vs
    WHERE vs.serial_number LIKE current_year_month || '%';

    -- Determine the next serial number
    IF max_serial IS NOT NULL THEN
        -- Extract the numeric part, increment, and pad with zeros
        next_serial := CAST(SUBSTRING(max_serial FROM 5) AS INTEGER) + 1;
    ELSE
        -- Start from 6 if no serial exists for the current year and month
        next_serial := 6;
    END IF;

    -- Format the serial number as a 4-digit string
    serial_number := LPAD(next_serial::TEXT, 4, '0');

    -- Combine year_month and serial_number
    NEW.serial_number := current_year_month || serial_number;

    RETURN NEW;
END;
$$;


--
-- Name: to_date_time_safe(text, text); Type: FUNCTION; Schema: workplace; Owner: -
--

CREATE FUNCTION workplace.to_date_time_safe(value text, format text) RETURNS timestamp without time zone
    LANGUAGE plpgsql
    AS $$
  BEGIN
    RETURN to_timestamp(value, format);
    EXCEPTION
      WHEN others THEN RETURN NULL;
  END;
  $$;


--
-- Name: update_database_updated_at_column(); Type: FUNCTION; Schema: workplace; Owner: -
--

CREATE FUNCTION workplace.update_database_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.database_updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;


--
-- Name: update_design_max_seq(); Type: FUNCTION; Schema: workplace; Owner: -
--

CREATE FUNCTION workplace.update_design_max_seq() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE workplace.designs
    SET max_seq = (SELECT MAX(design_seq)
                   FROM workplace.designs
                   WHERE design_year = NEW.design_year)
    WHERE id = NEW.id;

    RETURN NEW;
END;
$$;


--
-- Name: update_last_rfid_scan_time(); Type: FUNCTION; Schema: workplace; Owner: -
--

CREATE FUNCTION workplace.update_last_rfid_scan_time() RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE workplace.variant_serials AS vs
	SET
	stock_at = latest_scan.warehouse,
	last_rfid_scan_time = latest_scan.date_created
	FROM (
	SELECT date_created, warehouse, rfid_tag, serial_number
	FROM (
	    SELECT a.date_created, a.warehouse, b.rfid_tag, c.serial_number,
	           ROW_NUMBER() OVER (PARTITION BY b.rfid_tag ORDER BY a.date_created DESC) AS rn
	    FROM (
	        SELECT id, date_created, warehouse, jsonb_array_elements(lines)::INT4 AS line_id
	        FROM inventory_cms.inventory_check_sheets
	    ) a
	    JOIN (
	        SELECT id AS line_id, element->>0 AS rfid_tag
	        FROM inventory_cms.inventory_check_lines, jsonb_array_elements(rfid_tags) AS element
	    ) b ON a.line_id = b.line_id
	    LEFT JOIN workplace.variant_serials as c ON c.final_encoded_barcode =  LOWER(b.rfid_tag)
	) sub
	WHERE rn = 1

	) AS latest_scan
	WHERE
	vs.final_encoded_barcode = LOWER(latest_scan.rfid_tag);
END;
$$;


--
-- Name: update_order_references_in_variant_serials(); Type: FUNCTION; Schema: workplace; Owner: -
--

CREATE FUNCTION workplace.update_order_references_in_variant_serials() RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE workplace.variant_serials AS wvs
    SET
        order_reference = A.order_code,
        fulfillment_status_value = A.fulfillment_status_value
    FROM (
        WITH latest_line_items AS (
            SELECT
                bli.*,
                ROW_NUMBER() OVER (PARTITION BY bli.serial_number ORDER BY bli.database_updated_at DESC) AS row_num
            FROM
                bizflycrm.line_items AS bli
        )
        SELECT
            bsn.serial_number AS serial_number,
            serial_number_item ->> 'id' AS id,
            lli.barcode,
            bo.order_code,
            bo.fulfillment_status_value
        FROM
            latest_line_items AS lli
            LEFT JOIN bizflycrm.orders AS bo
                ON lli.order_id = bo.id
            JOIN LATERAL jsonb_array_elements(
                CASE
                    WHEN jsonb_typeof(lli.serial_number) = 'array' THEN lli.serial_number
                    WHEN jsonb_typeof(lli.serial_number) = 'object' THEN jsonb_build_array(lli.serial_number)
                    ELSE '[]'::jsonb
                END
            ) AS serial_number_item ON TRUE
            LEFT JOIN bizflycrm.serial_numbers AS bsn
                ON serial_number_item ->> 'id' = bsn.id
        WHERE
            bo.cancelled_status_value IN ('chưa', 'chưa hủy đơn hàng')
            AND lli.row_num = 1
    ) AS A
    WHERE wvs.serial_number = A.serial_number;
END;
$$;


--
-- Name: update_total_price(); Type: FUNCTION; Schema: workplace; Owner: -
--

CREATE FUNCTION workplace.update_total_price() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Update the total_price in the designs table
    UPDATE workplace.design_details
    SET melee_total_price = (
        SELECT SUM(md.price * dmd.quantity)
        FROM workplace.design_melee_details dmd
        JOIN workplace.melee_diamonds md ON dmd.melee_diamond_id = md.id
        WHERE dmd.design_detail_id = NEW.design_detail_id
    )
    WHERE id = NEW.design_detail_id;

    RETURN NEW;
END;
$$;


--
-- Name: validate_codes_pattern(); Type: FUNCTION; Schema: workplace; Owner: -
--

CREATE FUNCTION workplace.validate_codes_pattern() RETURNS trigger
    LANGUAGE plpgsql
    AS $_$
BEGIN
    -- Validate the 'codes' column using a regex that allows letters (a-z, A-Z), numbers (0-9), and dashes (-)
    IF NEW.codes !~ '^([a-zA-Z0-9-]+)(\n[a-zA-Z0-9-]+)*$' THEN
        RAISE EXCEPTION 'Invalid codes pattern. Each line must only contain letters (a-z, A-Z), numbers (0-9), or dashes (-).';
    END IF;

    RETURN NEW;
END;
$_$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: gold_pricing; Type: TABLE; Schema: market_data; Owner: -
--

CREATE TABLE market_data.gold_pricing (
    "time" timestamp without time zone NOT NULL,
    type character varying,
    buy numeric,
    sell numeric,
    created_at timestamp with time zone
);


--
-- Name: _hyper_2_11_chunk; Type: TABLE; Schema: _timescaledb_internal; Owner: -
--

CREATE TABLE _timescaledb_internal._hyper_2_11_chunk (
    CONSTRAINT constraint_11 CHECK ((("time" >= '2024-08-15 00:00:00'::timestamp without time zone) AND ("time" < '2024-08-22 00:00:00'::timestamp without time zone)))
)
INHERITS (market_data.gold_pricing);


--
-- Name: _hyper_2_13_chunk; Type: TABLE; Schema: _timescaledb_internal; Owner: -
--

CREATE TABLE _timescaledb_internal._hyper_2_13_chunk (
    CONSTRAINT constraint_13 CHECK ((("time" >= '2024-08-22 00:00:00'::timestamp without time zone) AND ("time" < '2024-08-29 00:00:00'::timestamp without time zone)))
)
INHERITS (market_data.gold_pricing);


--
-- Name: _hyper_2_15_chunk; Type: TABLE; Schema: _timescaledb_internal; Owner: -
--

CREATE TABLE _timescaledb_internal._hyper_2_15_chunk (
    CONSTRAINT constraint_15 CHECK ((("time" >= '2024-08-29 00:00:00'::timestamp without time zone) AND ("time" < '2024-09-05 00:00:00'::timestamp without time zone)))
)
INHERITS (market_data.gold_pricing);


--
-- Name: _hyper_2_17_chunk; Type: TABLE; Schema: _timescaledb_internal; Owner: -
--

CREATE TABLE _timescaledb_internal._hyper_2_17_chunk (
    CONSTRAINT constraint_17 CHECK ((("time" >= '2024-09-05 00:00:00'::timestamp without time zone) AND ("time" < '2024-09-12 00:00:00'::timestamp without time zone)))
)
INHERITS (market_data.gold_pricing);


--
-- Name: _hyper_2_19_chunk; Type: TABLE; Schema: _timescaledb_internal; Owner: -
--

CREATE TABLE _timescaledb_internal._hyper_2_19_chunk (
    CONSTRAINT constraint_19 CHECK ((("time" >= '2024-09-12 00:00:00'::timestamp without time zone) AND ("time" < '2024-09-19 00:00:00'::timestamp without time zone)))
)
INHERITS (market_data.gold_pricing);


--
-- Name: _hyper_2_21_chunk; Type: TABLE; Schema: _timescaledb_internal; Owner: -
--

CREATE TABLE _timescaledb_internal._hyper_2_21_chunk (
    CONSTRAINT constraint_21 CHECK ((("time" >= '2024-09-19 00:00:00'::timestamp without time zone) AND ("time" < '2024-09-26 00:00:00'::timestamp without time zone)))
)
INHERITS (market_data.gold_pricing);


--
-- Name: _hyper_2_23_chunk; Type: TABLE; Schema: _timescaledb_internal; Owner: -
--

CREATE TABLE _timescaledb_internal._hyper_2_23_chunk (
    CONSTRAINT constraint_23 CHECK ((("time" >= '2024-09-26 00:00:00'::timestamp without time zone) AND ("time" < '2024-10-03 00:00:00'::timestamp without time zone)))
)
INHERITS (market_data.gold_pricing);


--
-- Name: _hyper_2_25_chunk; Type: TABLE; Schema: _timescaledb_internal; Owner: -
--

CREATE TABLE _timescaledb_internal._hyper_2_25_chunk (
    CONSTRAINT constraint_25 CHECK ((("time" >= '2024-10-03 00:00:00'::timestamp without time zone) AND ("time" < '2024-10-10 00:00:00'::timestamp without time zone)))
)
INHERITS (market_data.gold_pricing);


--
-- Name: _hyper_2_27_chunk; Type: TABLE; Schema: _timescaledb_internal; Owner: -
--

CREATE TABLE _timescaledb_internal._hyper_2_27_chunk (
    CONSTRAINT constraint_27 CHECK ((("time" >= '2024-10-10 00:00:00'::timestamp without time zone) AND ("time" < '2024-10-17 00:00:00'::timestamp without time zone)))
)
INHERITS (market_data.gold_pricing);


--
-- Name: _hyper_2_2_chunk; Type: TABLE; Schema: _timescaledb_internal; Owner: -
--

CREATE TABLE _timescaledb_internal._hyper_2_2_chunk (
    CONSTRAINT constraint_2 CHECK ((("time" >= '2024-08-01 00:00:00'::timestamp without time zone) AND ("time" < '2024-08-08 00:00:00'::timestamp without time zone)))
)
INHERITS (market_data.gold_pricing);


--
-- Name: _hyper_2_9_chunk; Type: TABLE; Schema: _timescaledb_internal; Owner: -
--

CREATE TABLE _timescaledb_internal._hyper_2_9_chunk (
    CONSTRAINT constraint_9 CHECK ((("time" >= '2024-08-08 00:00:00'::timestamp without time zone) AND ("time" < '2024-08-15 00:00:00'::timestamp without time zone)))
)
INHERITS (market_data.gold_pricing);


--
-- Name: exchange_rate; Type: TABLE; Schema: market_data; Owner: -
--

CREATE TABLE market_data.exchange_rate (
    "time" timestamp without time zone NOT NULL,
    code character varying,
    bank character varying,
    buy numeric,
    sell numeric,
    transfer numeric,
    created_at timestamp without time zone
);


--
-- Name: _hyper_6_10_chunk; Type: TABLE; Schema: _timescaledb_internal; Owner: -
--

CREATE TABLE _timescaledb_internal._hyper_6_10_chunk (
    CONSTRAINT constraint_10 CHECK ((("time" >= '2024-08-08 00:00:00'::timestamp without time zone) AND ("time" < '2024-08-15 00:00:00'::timestamp without time zone)))
)
INHERITS (market_data.exchange_rate);


--
-- Name: _hyper_6_12_chunk; Type: TABLE; Schema: _timescaledb_internal; Owner: -
--

CREATE TABLE _timescaledb_internal._hyper_6_12_chunk (
    CONSTRAINT constraint_12 CHECK ((("time" >= '2024-08-15 00:00:00'::timestamp without time zone) AND ("time" < '2024-08-22 00:00:00'::timestamp without time zone)))
)
INHERITS (market_data.exchange_rate);


--
-- Name: _hyper_6_14_chunk; Type: TABLE; Schema: _timescaledb_internal; Owner: -
--

CREATE TABLE _timescaledb_internal._hyper_6_14_chunk (
    CONSTRAINT constraint_14 CHECK ((("time" >= '2024-08-22 00:00:00'::timestamp without time zone) AND ("time" < '2024-08-29 00:00:00'::timestamp without time zone)))
)
INHERITS (market_data.exchange_rate);


--
-- Name: _hyper_6_16_chunk; Type: TABLE; Schema: _timescaledb_internal; Owner: -
--

CREATE TABLE _timescaledb_internal._hyper_6_16_chunk (
    CONSTRAINT constraint_16 CHECK ((("time" >= '2024-08-29 00:00:00'::timestamp without time zone) AND ("time" < '2024-09-05 00:00:00'::timestamp without time zone)))
)
INHERITS (market_data.exchange_rate);


--
-- Name: _hyper_6_18_chunk; Type: TABLE; Schema: _timescaledb_internal; Owner: -
--

CREATE TABLE _timescaledb_internal._hyper_6_18_chunk (
    CONSTRAINT constraint_18 CHECK ((("time" >= '2024-09-05 00:00:00'::timestamp without time zone) AND ("time" < '2024-09-12 00:00:00'::timestamp without time zone)))
)
INHERITS (market_data.exchange_rate);


--
-- Name: _hyper_6_20_chunk; Type: TABLE; Schema: _timescaledb_internal; Owner: -
--

CREATE TABLE _timescaledb_internal._hyper_6_20_chunk (
    CONSTRAINT constraint_20 CHECK ((("time" >= '2024-09-12 00:00:00'::timestamp without time zone) AND ("time" < '2024-09-19 00:00:00'::timestamp without time zone)))
)
INHERITS (market_data.exchange_rate);


--
-- Name: _hyper_6_22_chunk; Type: TABLE; Schema: _timescaledb_internal; Owner: -
--

CREATE TABLE _timescaledb_internal._hyper_6_22_chunk (
    CONSTRAINT constraint_22 CHECK ((("time" >= '2024-09-19 00:00:00'::timestamp without time zone) AND ("time" < '2024-09-26 00:00:00'::timestamp without time zone)))
)
INHERITS (market_data.exchange_rate);


--
-- Name: _hyper_6_24_chunk; Type: TABLE; Schema: _timescaledb_internal; Owner: -
--

CREATE TABLE _timescaledb_internal._hyper_6_24_chunk (
    CONSTRAINT constraint_24 CHECK ((("time" >= '2024-09-26 00:00:00'::timestamp without time zone) AND ("time" < '2024-10-03 00:00:00'::timestamp without time zone)))
)
INHERITS (market_data.exchange_rate);


--
-- Name: _hyper_6_26_chunk; Type: TABLE; Schema: _timescaledb_internal; Owner: -
--

CREATE TABLE _timescaledb_internal._hyper_6_26_chunk (
    CONSTRAINT constraint_26 CHECK ((("time" >= '2024-10-03 00:00:00'::timestamp without time zone) AND ("time" < '2024-10-10 00:00:00'::timestamp without time zone)))
)
INHERITS (market_data.exchange_rate);


--
-- Name: _hyper_6_28_chunk; Type: TABLE; Schema: _timescaledb_internal; Owner: -
--

CREATE TABLE _timescaledb_internal._hyper_6_28_chunk (
    CONSTRAINT constraint_28 CHECK ((("time" >= '2024-10-10 00:00:00'::timestamp without time zone) AND ("time" < '2024-10-17 00:00:00'::timestamp without time zone)))
)
INHERITS (market_data.exchange_rate);


--
-- Name: _hyper_6_29_chunk; Type: TABLE; Schema: _timescaledb_internal; Owner: -
--

CREATE TABLE _timescaledb_internal._hyper_6_29_chunk (
    CONSTRAINT constraint_29 CHECK ((("time" >= '2024-10-17 00:00:00'::timestamp without time zone) AND ("time" < '2024-10-24 00:00:00'::timestamp without time zone)))
)
INHERITS (market_data.exchange_rate);


--
-- Name: _hyper_6_30_chunk; Type: TABLE; Schema: _timescaledb_internal; Owner: -
--

CREATE TABLE _timescaledb_internal._hyper_6_30_chunk (
    CONSTRAINT constraint_30 CHECK ((("time" >= '2024-10-24 00:00:00'::timestamp without time zone) AND ("time" < '2024-10-31 00:00:00'::timestamp without time zone)))
)
INHERITS (market_data.exchange_rate);


--
-- Name: _hyper_6_31_chunk; Type: TABLE; Schema: _timescaledb_internal; Owner: -
--

CREATE TABLE _timescaledb_internal._hyper_6_31_chunk (
    CONSTRAINT constraint_31 CHECK ((("time" >= '2024-10-31 00:00:00'::timestamp without time zone) AND ("time" < '2024-11-07 00:00:00'::timestamp without time zone)))
)
INHERITS (market_data.exchange_rate);


--
-- Name: _hyper_6_32_chunk; Type: TABLE; Schema: _timescaledb_internal; Owner: -
--

CREATE TABLE _timescaledb_internal._hyper_6_32_chunk (
    CONSTRAINT constraint_32 CHECK ((("time" >= '2024-11-07 00:00:00'::timestamp without time zone) AND ("time" < '2024-11-14 00:00:00'::timestamp without time zone)))
)
INHERITS (market_data.exchange_rate);


--
-- Name: _hyper_6_33_chunk; Type: TABLE; Schema: _timescaledb_internal; Owner: -
--

CREATE TABLE _timescaledb_internal._hyper_6_33_chunk (
    CONSTRAINT constraint_33 CHECK ((("time" >= '2024-11-14 00:00:00'::timestamp without time zone) AND ("time" < '2024-11-21 00:00:00'::timestamp without time zone)))
)
INHERITS (market_data.exchange_rate);


--
-- Name: _hyper_6_34_chunk; Type: TABLE; Schema: _timescaledb_internal; Owner: -
--

CREATE TABLE _timescaledb_internal._hyper_6_34_chunk (
    CONSTRAINT constraint_34 CHECK ((("time" >= '2024-11-21 00:00:00'::timestamp without time zone) AND ("time" < '2024-11-28 00:00:00'::timestamp without time zone)))
)
INHERITS (market_data.exchange_rate);


--
-- Name: _hyper_6_35_chunk; Type: TABLE; Schema: _timescaledb_internal; Owner: -
--

CREATE TABLE _timescaledb_internal._hyper_6_35_chunk (
    CONSTRAINT constraint_35 CHECK ((("time" >= '2024-11-28 00:00:00'::timestamp without time zone) AND ("time" < '2024-12-05 00:00:00'::timestamp without time zone)))
)
INHERITS (market_data.exchange_rate);


--
-- Name: _hyper_6_36_chunk; Type: TABLE; Schema: _timescaledb_internal; Owner: -
--

CREATE TABLE _timescaledb_internal._hyper_6_36_chunk (
    CONSTRAINT constraint_36 CHECK ((("time" >= '2024-12-05 00:00:00'::timestamp without time zone) AND ("time" < '2024-12-12 00:00:00'::timestamp without time zone)))
)
INHERITS (market_data.exchange_rate);


--
-- Name: _hyper_6_37_chunk; Type: TABLE; Schema: _timescaledb_internal; Owner: -
--

CREATE TABLE _timescaledb_internal._hyper_6_37_chunk (
    CONSTRAINT constraint_37 CHECK ((("time" >= '2024-12-12 00:00:00'::timestamp without time zone) AND ("time" < '2024-12-19 00:00:00'::timestamp without time zone)))
)
INHERITS (market_data.exchange_rate);


--
-- Name: _hyper_6_38_chunk; Type: TABLE; Schema: _timescaledb_internal; Owner: -
--

CREATE TABLE _timescaledb_internal._hyper_6_38_chunk (
    CONSTRAINT constraint_38 CHECK ((("time" >= '2024-12-19 00:00:00'::timestamp without time zone) AND ("time" < '2024-12-26 00:00:00'::timestamp without time zone)))
)
INHERITS (market_data.exchange_rate);


--
-- Name: _hyper_6_39_chunk; Type: TABLE; Schema: _timescaledb_internal; Owner: -
--

CREATE TABLE _timescaledb_internal._hyper_6_39_chunk (
    CONSTRAINT constraint_39 CHECK ((("time" >= '2024-12-26 00:00:00'::timestamp without time zone) AND ("time" < '2025-01-02 00:00:00'::timestamp without time zone)))
)
INHERITS (market_data.exchange_rate);


--
-- Name: _hyper_6_40_chunk; Type: TABLE; Schema: _timescaledb_internal; Owner: -
--

CREATE TABLE _timescaledb_internal._hyper_6_40_chunk (
    CONSTRAINT constraint_40 CHECK ((("time" >= '2025-01-02 00:00:00'::timestamp without time zone) AND ("time" < '2025-01-09 00:00:00'::timestamp without time zone)))
)
INHERITS (market_data.exchange_rate);


--
-- Name: _hyper_6_41_chunk; Type: TABLE; Schema: _timescaledb_internal; Owner: -
--

CREATE TABLE _timescaledb_internal._hyper_6_41_chunk (
    CONSTRAINT constraint_41 CHECK ((("time" >= '2025-01-09 00:00:00'::timestamp without time zone) AND ("time" < '2025-01-16 00:00:00'::timestamp without time zone)))
)
INHERITS (market_data.exchange_rate);


--
-- Name: _hyper_6_42_chunk; Type: TABLE; Schema: _timescaledb_internal; Owner: -
--

CREATE TABLE _timescaledb_internal._hyper_6_42_chunk (
    CONSTRAINT constraint_42 CHECK ((("time" >= '2025-01-16 00:00:00'::timestamp without time zone) AND ("time" < '2025-01-23 00:00:00'::timestamp without time zone)))
)
INHERITS (market_data.exchange_rate);


--
-- Name: _hyper_6_43_chunk; Type: TABLE; Schema: _timescaledb_internal; Owner: -
--

CREATE TABLE _timescaledb_internal._hyper_6_43_chunk (
    CONSTRAINT constraint_43 CHECK ((("time" >= '2025-01-23 00:00:00'::timestamp without time zone) AND ("time" < '2025-01-30 00:00:00'::timestamp without time zone)))
)
INHERITS (market_data.exchange_rate);


--
-- Name: _hyper_6_44_chunk; Type: TABLE; Schema: _timescaledb_internal; Owner: -
--

CREATE TABLE _timescaledb_internal._hyper_6_44_chunk (
    CONSTRAINT constraint_44 CHECK ((("time" >= '2025-01-30 00:00:00'::timestamp without time zone) AND ("time" < '2025-02-06 00:00:00'::timestamp without time zone)))
)
INHERITS (market_data.exchange_rate);


--
-- Name: _hyper_6_45_chunk; Type: TABLE; Schema: _timescaledb_internal; Owner: -
--

CREATE TABLE _timescaledb_internal._hyper_6_45_chunk (
    CONSTRAINT constraint_45 CHECK ((("time" >= '2025-02-06 00:00:00'::timestamp without time zone) AND ("time" < '2025-02-13 00:00:00'::timestamp without time zone)))
)
INHERITS (market_data.exchange_rate);


--
-- Name: _hyper_6_46_chunk; Type: TABLE; Schema: _timescaledb_internal; Owner: -
--

CREATE TABLE _timescaledb_internal._hyper_6_46_chunk (
    CONSTRAINT constraint_46 CHECK ((("time" >= '2025-02-13 00:00:00'::timestamp without time zone) AND ("time" < '2025-02-20 00:00:00'::timestamp without time zone)))
)
INHERITS (market_data.exchange_rate);


--
-- Name: _hyper_6_47_chunk; Type: TABLE; Schema: _timescaledb_internal; Owner: -
--

CREATE TABLE _timescaledb_internal._hyper_6_47_chunk (
    CONSTRAINT constraint_47 CHECK ((("time" >= '2025-02-20 00:00:00'::timestamp without time zone) AND ("time" < '2025-02-27 00:00:00'::timestamp without time zone)))
)
INHERITS (market_data.exchange_rate);


--
-- Name: _hyper_6_48_chunk; Type: TABLE; Schema: _timescaledb_internal; Owner: -
--

CREATE TABLE _timescaledb_internal._hyper_6_48_chunk (
    CONSTRAINT constraint_48 CHECK ((("time" >= '2025-02-27 00:00:00'::timestamp without time zone) AND ("time" < '2025-03-06 00:00:00'::timestamp without time zone)))
)
INHERITS (market_data.exchange_rate);


--
-- Name: _hyper_6_49_chunk; Type: TABLE; Schema: _timescaledb_internal; Owner: -
--

CREATE TABLE _timescaledb_internal._hyper_6_49_chunk (
    CONSTRAINT constraint_49 CHECK ((("time" >= '2025-03-06 00:00:00'::timestamp without time zone) AND ("time" < '2025-03-13 00:00:00'::timestamp without time zone)))
)
INHERITS (market_data.exchange_rate);


--
-- Name: _hyper_6_50_chunk; Type: TABLE; Schema: _timescaledb_internal; Owner: -
--

CREATE TABLE _timescaledb_internal._hyper_6_50_chunk (
    CONSTRAINT constraint_50 CHECK ((("time" >= '2025-03-13 00:00:00'::timestamp without time zone) AND ("time" < '2025-03-20 00:00:00'::timestamp without time zone)))
)
INHERITS (market_data.exchange_rate);


--
-- Name: _hyper_6_51_chunk; Type: TABLE; Schema: _timescaledb_internal; Owner: -
--

CREATE TABLE _timescaledb_internal._hyper_6_51_chunk (
    CONSTRAINT constraint_51 CHECK ((("time" >= '2025-03-20 00:00:00'::timestamp without time zone) AND ("time" < '2025-03-27 00:00:00'::timestamp without time zone)))
)
INHERITS (market_data.exchange_rate);


--
-- Name: _hyper_6_52_chunk; Type: TABLE; Schema: _timescaledb_internal; Owner: -
--

CREATE TABLE _timescaledb_internal._hyper_6_52_chunk (
    CONSTRAINT constraint_52 CHECK ((("time" >= '2025-03-27 00:00:00'::timestamp without time zone) AND ("time" < '2025-04-03 00:00:00'::timestamp without time zone)))
)
INHERITS (market_data.exchange_rate);


--
-- Name: _hyper_6_53_chunk; Type: TABLE; Schema: _timescaledb_internal; Owner: -
--

CREATE TABLE _timescaledb_internal._hyper_6_53_chunk (
    CONSTRAINT constraint_53 CHECK ((("time" >= '2025-04-03 00:00:00'::timestamp without time zone) AND ("time" < '2025-04-10 00:00:00'::timestamp without time zone)))
)
INHERITS (market_data.exchange_rate);


--
-- Name: _hyper_6_54_chunk; Type: TABLE; Schema: _timescaledb_internal; Owner: -
--

CREATE TABLE _timescaledb_internal._hyper_6_54_chunk (
    CONSTRAINT constraint_54 CHECK ((("time" >= '2025-04-10 00:00:00'::timestamp without time zone) AND ("time" < '2025-04-17 00:00:00'::timestamp without time zone)))
)
INHERITS (market_data.exchange_rate);


--
-- Name: _hyper_6_55_chunk; Type: TABLE; Schema: _timescaledb_internal; Owner: -
--

CREATE TABLE _timescaledb_internal._hyper_6_55_chunk (
    CONSTRAINT constraint_55 CHECK ((("time" >= '2025-04-17 00:00:00'::timestamp without time zone) AND ("time" < '2025-04-24 00:00:00'::timestamp without time zone)))
)
INHERITS (market_data.exchange_rate);


--
-- Name: _hyper_6_56_chunk; Type: TABLE; Schema: _timescaledb_internal; Owner: -
--

CREATE TABLE _timescaledb_internal._hyper_6_56_chunk (
    CONSTRAINT constraint_56 CHECK ((("time" >= '2025-04-24 00:00:00'::timestamp without time zone) AND ("time" < '2025-05-01 00:00:00'::timestamp without time zone)))
)
INHERITS (market_data.exchange_rate);


--
-- Name: _hyper_6_57_chunk; Type: TABLE; Schema: _timescaledb_internal; Owner: -
--

CREATE TABLE _timescaledb_internal._hyper_6_57_chunk (
    CONSTRAINT constraint_57 CHECK ((("time" >= '2025-05-01 00:00:00'::timestamp without time zone) AND ("time" < '2025-05-08 00:00:00'::timestamp without time zone)))
)
INHERITS (market_data.exchange_rate);


--
-- Name: _hyper_6_58_chunk; Type: TABLE; Schema: _timescaledb_internal; Owner: -
--

CREATE TABLE _timescaledb_internal._hyper_6_58_chunk (
    CONSTRAINT constraint_58 CHECK ((("time" >= '2025-05-08 00:00:00'::timestamp without time zone) AND ("time" < '2025-05-15 00:00:00'::timestamp without time zone)))
)
INHERITS (market_data.exchange_rate);


--
-- Name: _hyper_6_59_chunk; Type: TABLE; Schema: _timescaledb_internal; Owner: -
--

CREATE TABLE _timescaledb_internal._hyper_6_59_chunk (
    CONSTRAINT constraint_59 CHECK ((("time" >= '2025-05-15 00:00:00'::timestamp without time zone) AND ("time" < '2025-05-22 00:00:00'::timestamp without time zone)))
)
INHERITS (market_data.exchange_rate);


--
-- Name: _hyper_6_60_chunk; Type: TABLE; Schema: _timescaledb_internal; Owner: -
--

CREATE TABLE _timescaledb_internal._hyper_6_60_chunk (
    CONSTRAINT constraint_60 CHECK ((("time" >= '2025-05-22 00:00:00'::timestamp without time zone) AND ("time" < '2025-05-29 00:00:00'::timestamp without time zone)))
)
INHERITS (market_data.exchange_rate);


--
-- Name: _hyper_6_8_chunk; Type: TABLE; Schema: _timescaledb_internal; Owner: -
--

CREATE TABLE _timescaledb_internal._hyper_6_8_chunk (
    CONSTRAINT constraint_8 CHECK ((("time" >= '2024-08-01 00:00:00'::timestamp without time zone) AND ("time" < '2024-08-08 00:00:00'::timestamp without time zone)))
)
INHERITS (market_data.exchange_rate);


--
-- Name: platforms; Type: TABLE; Schema: advertising_cost; Owner: -
--

CREATE TABLE advertising_cost.platforms (
    uuid character varying NOT NULL,
    id character varying,
    channel character varying,
    name character varying,
    page_id character varying,
    platform character varying,
    area character varying,
    updated_at bigint,
    database_created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    database_updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: allocations; Type: TABLE; Schema: bizflycrm; Owner: -
--

CREATE TABLE bizflycrm.allocations (
    uuid character varying(36) NOT NULL,
    id character varying(50),
    total_amount numeric(36,8),
    allocation_amount numeric(36,8),
    allocation_amount_percent numeric(36,8),
    allocation_date timestamp without time zone,
    sale jsonb,
    "order" jsonb,
    customer jsonb,
    contract jsonb,
    created_by jsonb,
    status character varying,
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    created_at_system timestamp without time zone,
    _auto_id bigint,
    sale_team jsonb,
    _related_department jsonb,
    piece double precision,
    total_pieces double precision,
    ngay_phan_bo timestamp without time zone,
    source jsonb,
    payload jsonb,
    order_id character varying(50),
    customer_id character varying(50),
    sale_id character varying(50),
    sale_name character varying(255),
    sale_team_id character varying(50),
    sale_team_value character varying(255),
    database_created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    database_updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: calls; Type: TABLE; Schema: bizflycrm; Owner: -
--

CREATE TABLE bizflycrm.calls (
    uuid character varying(36) NOT NULL,
    id character varying(50),
    action character varying,
    answer_time timestamp without time zone,
    bizfly_project_token character varying,
    call_id character varying,
    call_status jsonb,
    call_status_type jsonb,
    callee jsonb,
    caller jsonb,
    collection_key character varying,
    created_at timestamp without time zone,
    created_at_system timestamp without time zone,
    customer_id character varying,
    customer_phones jsonb,
    end_time timestamp without time zone,
    note character varying,
    phone_call_id character varying,
    project_id character varying,
    related_id jsonb,
    run integer,
    sale jsonb,
    sale_phones jsonb,
    sale_team jsonb,
    status character varying,
    updated_at timestamp without time zone,
    payload jsonb,
    callee_value character varying,
    caller_value character varying,
    database_created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    database_updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: customers; Type: TABLE; Schema: bizflycrm; Owner: -
--

CREATE TABLE bizflycrm.customers (
    uuid character varying(36) NOT NULL,
    id character varying(50),
    _first_order timestamp without time zone,
    _last_order timestamp without time zone,
    _number_order integer,
    _order_value numeric(36,8),
    _order_value_in_year numeric(36,8),
    _paid_value numeric(36,8),
    _total_order_data_item integer,
    address1 character varying,
    bank_account_number character varying(50),
    bank_address jsonb,
    bank_branch character varying,
    bank_name character varying,
    city_name character varying,
    company_address character varying,
    company_name character varying,
    country_name character varying,
    created_at timestamp without time zone,
    created_at_system timestamp without time zone,
    cumulative_tov_buyback numeric(36,8),
    cumulative_tov_in_last_12mos numeric(36,8),
    cumulative_tov_lifetime numeric(36,8),
    cumulative_tov_recorded numeric(36,8),
    customer_rank jsonb,
    customer_type jsonb,
    customer_types jsonb,
    customer_vat_email jsonb,
    date_of_issuance timestamp without time zone,
    district_name character varying,
    emails jsonb,
    first_channel jsonb,
    haravan_id character varying,
    haravan_retailer character varying,
    instagram_sender_id character varying,
    link_blank character varying,
    lists jsonb,
    loai_qua_tang jsonb,
    ma_khach_hang character varying,
    ma_kich_hoat character varying,
    name jsonb,
    ngay_tao_tai_khoan timestamp without time zone,
    past_order_value numeric(36,8),
    personal_id character varying,
    phones jsonb,
    place_of_issuance jsonb,
    rd_address character varying,
    rd_bizfly_bot_id character varying,
    rd_first_assign_for timestamp without time zone,
    rd_first_phone_time timestamp without time zone,
    rd_gender character varying,
    rd_last_phone_update_time timestamp without time zone,
    sale jsonb,
    source jsonb,
    status character varying,
    tags jsonb,
    tax_code character varying,
    tong_gia_tri_thu_mua_2 numeric(36,8),
    updated_at timestamp without time zone,
    user_spam boolean,
    utm_first_utm_source jsonb,
    ward_name character varying,
    website character varying,
    xung_ho jsonb,
    zalo_sender_id character varying,
    _date_sinh_nhat timestamp without time zone,
    customer_passport character varying,
    gioi_tinh jsonb,
    link_facebook character varying,
    passport_date_of_issuance timestamp without time zone,
    passport_place_of_issuance jsonb,
    sinh_nhat timestamp without time zone,
    customer_journey jsonb,
    account jsonb,
    customer_referral jsonb,
    dia_chi character varying,
    files jsonb,
    note character varying,
    owner jsonb,
    rd_addresses character varying,
    rd_tags jsonb,
    sale_team jsonb,
    utm_campaign jsonb,
    utm_content jsonb,
    utm_medium jsonb,
    utm_referer jsonb,
    utm_source jsonb,
    utm_term jsonb,
    app_first_login_date timestamp without time zone,
    _last_activity_time timestamp without time zone,
    _last_note_time timestamp without time zone,
    _utm_all jsonb,
    facebook_id_fp character varying,
    facebook_sender_id character varying,
    is_merge_item boolean,
    linking_fanpage jsonb,
    rd_conversation_id character varying,
    rd_first_fb_message_time timestamp without time zone,
    rd_first_name character varying,
    rd_first_support_assign_for character varying,
    rd_full_name character varying,
    rd_last_fb_message_messenger_time timestamp without time zone,
    rd_owner_time timestamp without time zone,
    rd_user_id character varying,
    rd_username character varying,
    _first_time_assign_main_sale timestamp without time zone,
    _last_call_in_time timestamp without time zone,
    _last_call_out_time timestamp without time zone,
    _last_time_assign_main_sale timestamp without time zone,
    _related_department jsonb,
    chien_dich character varying,
    created_by jsonb,
    customer_care_employee jsonb,
    customer_related jsonb,
    product jsonb,
    rd_last_assign_for timestamp without time zone,
    rd_last_message_time_old_user timestamp without time zone,
    rd_last_name character varying,
    ref_types jsonb,
    utm_converted_last_utm_campaign jsonb,
    utm_converted_last_utm_content jsonb,
    utm_converted_last_utm_medium jsonb,
    utm_converted_last_utm_referer jsonb,
    utm_converted_last_utm_source jsonb,
    utm_converted_last_utm_term jsonb,
    utm_converted_utm_campaign jsonb,
    utm_converted_utm_medium jsonb,
    utm_converted_utm_referer jsonb,
    utm_converted_utm_source jsonb,
    utm_converted_utm_term jsonb,
    utm_first_utm_campaign jsonb,
    utm_first_utm_content jsonb,
    utm_first_utm_medium jsonb,
    utm_first_utm_referer jsonb,
    utm_first_utm_term jsonb,
    utm_last_utm_campaign jsonb,
    utm_last_utm_content jsonb,
    utm_last_utm_medium jsonb,
    utm_last_utm_referer jsonb,
    utm_last_utm_source jsonb,
    utm_last_utm_term jsonb,
    cumulative_tov_referral numeric(36,8),
    demotion_date timestamp without time zone,
    customer_status jsonb,
    sale_history jsonb,
    age_group jsonb,
    facebook_id jsonb,
    rd_fb_user_id character varying,
    _recent_sale jsonb,
    _total_call_in integer,
    cumulative_tov_in_last_12_months numeric(36,8),
    cumulative_tov_unrecorded numeric(36,8),
    customer_birthday_update_pwa timestamp without time zone,
    customer_email_update_pwa character varying,
    customer_vat_types jsonb,
    rd_last_zalo_messages_time timestamp without time zone,
    rd_page_active character varying,
    tmp_unique character varying,
    rd_ref_facebook jsonb,
    chi_tiet_don_hang_gioi_thieu jsonb,
    ads jsonb,
    _is_converted integer,
    customer_rank_label character varying,
    customer_type_label character varying,
    customer_types_label character varying,
    first_channel_label character varying,
    gioi_tinh_label character varying,
    name_value character varying,
    phone_value character varying,
    owner_name character varying,
    owner_id character varying,
    sale_name character varying,
    sale_id character varying,
    age_group_label character varying,
    place_of_issuance_label character varying,
    customer_care_employee_name character varying,
    passport_place_of_issuance_label character varying,
    database_created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    database_updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    customer_opportunities jsonb
);


--
-- Name: custom_lead_view; Type: MATERIALIZED VIEW; Schema: bizflycrm; Owner: -
--

CREATE MATERIALIZED VIEW bizflycrm.custom_lead_view AS
 SELECT uuid,
    id,
    _first_order,
    _last_order,
    _number_order,
    _order_value,
    _order_value_in_year,
    _paid_value,
    _total_order_data_item,
    address1,
    bank_account_number,
    bank_address,
    bank_branch,
    bank_name,
    city_name,
    company_address,
    company_name,
    country_name,
    created_at,
    created_at_system,
    cumulative_tov_buyback,
    cumulative_tov_in_last_12mos,
    cumulative_tov_lifetime,
    cumulative_tov_recorded,
    customer_rank,
    customer_type,
    customer_types,
    customer_vat_email,
    date_of_issuance,
    district_name,
    emails,
    first_channel,
    haravan_id,
    haravan_retailer,
    instagram_sender_id,
    link_blank,
    lists,
    loai_qua_tang,
    ma_khach_hang,
    ma_kich_hoat,
    name,
    ngay_tao_tai_khoan,
    past_order_value,
    personal_id,
    phones,
    place_of_issuance,
    rd_address,
    rd_bizfly_bot_id,
    rd_first_assign_for,
    rd_first_phone_time,
    rd_gender,
    rd_last_phone_update_time,
    sale,
    source,
    status,
    tags,
    tax_code,
    tong_gia_tri_thu_mua_2,
    updated_at,
    user_spam,
    utm_first_utm_source,
    ward_name,
    website,
    xung_ho,
    zalo_sender_id,
    _date_sinh_nhat,
    customer_passport,
    gioi_tinh,
    link_facebook,
    passport_date_of_issuance,
    passport_place_of_issuance,
    sinh_nhat,
    customer_journey,
    account,
    customer_referral,
    dia_chi,
    files,
    note,
    owner,
    rd_addresses,
    rd_tags,
    sale_team,
    utm_campaign,
    utm_content,
    utm_medium,
    utm_referer,
    utm_source,
    utm_term,
    app_first_login_date,
    _last_activity_time,
    _last_note_time,
    _utm_all,
    facebook_id_fp,
    facebook_sender_id,
    is_merge_item,
    linking_fanpage,
    rd_conversation_id,
    rd_first_fb_message_time,
    rd_first_name,
    rd_first_support_assign_for,
    rd_full_name,
    rd_last_fb_message_messenger_time,
    rd_owner_time,
    rd_user_id,
    rd_username,
    _first_time_assign_main_sale,
    _last_call_in_time,
    _last_call_out_time,
    _last_time_assign_main_sale,
    _related_department,
    chien_dich,
    created_by,
    customer_care_employee,
    customer_related,
    product,
    rd_last_assign_for,
    rd_last_message_time_old_user,
    rd_last_name,
    ref_types,
    utm_converted_last_utm_campaign,
    utm_converted_last_utm_content,
    utm_converted_last_utm_medium,
    utm_converted_last_utm_referer,
    utm_converted_last_utm_source,
    utm_converted_last_utm_term,
    utm_converted_utm_campaign,
    utm_converted_utm_medium,
    utm_converted_utm_referer,
    utm_converted_utm_source,
    utm_converted_utm_term,
    utm_first_utm_campaign,
    utm_first_utm_content,
    utm_first_utm_medium,
    utm_first_utm_referer,
    utm_first_utm_term,
    utm_last_utm_campaign,
    utm_last_utm_content,
    utm_last_utm_medium,
    utm_last_utm_referer,
    utm_last_utm_source,
    utm_last_utm_term,
    cumulative_tov_referral,
    demotion_date,
    customer_status,
    sale_history,
    age_group,
    facebook_id,
    rd_fb_user_id,
    _recent_sale,
    _total_call_in,
    cumulative_tov_in_last_12_months,
    cumulative_tov_unrecorded,
    customer_birthday_update_pwa,
    customer_email_update_pwa,
    customer_vat_types,
    rd_last_zalo_messages_time,
    rd_page_active,
    tmp_unique,
    rd_ref_facebook,
    chi_tiet_don_hang_gioi_thieu,
    ads,
    _is_converted,
    customer_rank_label,
    customer_type_label,
    customer_types_label,
    first_channel_label,
    gioi_tinh_label,
    name_value,
    phone_value,
    owner_name,
    owner_id,
    sale_name,
    sale_id,
    age_group_label,
    place_of_issuance_label,
    customer_care_employee_name,
    passport_place_of_issuance_label,
    database_created_at,
    database_updated_at,
    customer_opportunities,
    first_group_source
   FROM ( SELECT bc.uuid,
            bc.id,
            bc._first_order,
            bc._last_order,
            bc._number_order,
            bc._order_value,
            bc._order_value_in_year,
            bc._paid_value,
            bc._total_order_data_item,
            bc.address1,
            bc.bank_account_number,
            bc.bank_address,
            bc.bank_branch,
            bc.bank_name,
            bc.city_name,
            bc.company_address,
            bc.company_name,
            bc.country_name,
            bc.created_at,
            bc.created_at_system,
            bc.cumulative_tov_buyback,
            bc.cumulative_tov_in_last_12mos,
            bc.cumulative_tov_lifetime,
            bc.cumulative_tov_recorded,
            bc.customer_rank,
            bc.customer_type,
            bc.customer_types,
            bc.customer_vat_email,
            bc.date_of_issuance,
            bc.district_name,
            bc.emails,
            bc.first_channel,
            bc.haravan_id,
            bc.haravan_retailer,
            bc.instagram_sender_id,
            bc.link_blank,
            bc.lists,
            bc.loai_qua_tang,
            bc.ma_khach_hang,
            bc.ma_kich_hoat,
            bc.name,
            bc.ngay_tao_tai_khoan,
            bc.past_order_value,
            bc.personal_id,
            bc.phones,
            bc.place_of_issuance,
            bc.rd_address,
            bc.rd_bizfly_bot_id,
            bc.rd_first_assign_for,
            bc.rd_first_phone_time,
            bc.rd_gender,
            bc.rd_last_phone_update_time,
            bc.sale,
            bc.source,
            bc.status,
            bc.tags,
            bc.tax_code,
            bc.tong_gia_tri_thu_mua_2,
            bc.updated_at,
            bc.user_spam,
            bc.utm_first_utm_source,
            bc.ward_name,
            bc.website,
            bc.xung_ho,
            bc.zalo_sender_id,
            bc._date_sinh_nhat,
            bc.customer_passport,
            bc.gioi_tinh,
            bc.link_facebook,
            bc.passport_date_of_issuance,
            bc.passport_place_of_issuance,
            bc.sinh_nhat,
            bc.customer_journey,
            bc.account,
            bc.customer_referral,
            bc.dia_chi,
            bc.files,
            bc.note,
            bc.owner,
            bc.rd_addresses,
            bc.rd_tags,
            bc.sale_team,
            bc.utm_campaign,
            bc.utm_content,
            bc.utm_medium,
            bc.utm_referer,
            bc.utm_source,
            bc.utm_term,
            bc.app_first_login_date,
            bc._last_activity_time,
            bc._last_note_time,
            bc._utm_all,
            bc.facebook_id_fp,
            bc.facebook_sender_id,
            bc.is_merge_item,
            bc.linking_fanpage,
            bc.rd_conversation_id,
            bc.rd_first_fb_message_time,
            bc.rd_first_name,
            bc.rd_first_support_assign_for,
            bc.rd_full_name,
            bc.rd_last_fb_message_messenger_time,
            bc.rd_owner_time,
            bc.rd_user_id,
            bc.rd_username,
            bc._first_time_assign_main_sale,
            bc._last_call_in_time,
            bc._last_call_out_time,
            bc._last_time_assign_main_sale,
            bc._related_department,
            bc.chien_dich,
            bc.created_by,
            bc.customer_care_employee,
            bc.customer_related,
            bc.product,
            bc.rd_last_assign_for,
            bc.rd_last_message_time_old_user,
            bc.rd_last_name,
            bc.ref_types,
            bc.utm_converted_last_utm_campaign,
            bc.utm_converted_last_utm_content,
            bc.utm_converted_last_utm_medium,
            bc.utm_converted_last_utm_referer,
            bc.utm_converted_last_utm_source,
            bc.utm_converted_last_utm_term,
            bc.utm_converted_utm_campaign,
            bc.utm_converted_utm_medium,
            bc.utm_converted_utm_referer,
            bc.utm_converted_utm_source,
            bc.utm_converted_utm_term,
            bc.utm_first_utm_campaign,
            bc.utm_first_utm_content,
            bc.utm_first_utm_medium,
            bc.utm_first_utm_referer,
            bc.utm_first_utm_term,
            bc.utm_last_utm_campaign,
            bc.utm_last_utm_content,
            bc.utm_last_utm_medium,
            bc.utm_last_utm_referer,
            bc.utm_last_utm_source,
            bc.utm_last_utm_term,
            bc.cumulative_tov_referral,
            bc.demotion_date,
            bc.customer_status,
            bc.sale_history,
            bc.age_group,
            bc.facebook_id,
            bc.rd_fb_user_id,
            bc._recent_sale,
            bc._total_call_in,
            bc.cumulative_tov_in_last_12_months,
            bc.cumulative_tov_unrecorded,
            bc.customer_birthday_update_pwa,
            bc.customer_email_update_pwa,
            bc.customer_vat_types,
            bc.rd_last_zalo_messages_time,
            bc.rd_page_active,
            bc.tmp_unique,
            bc.rd_ref_facebook,
            bc.chi_tiet_don_hang_gioi_thieu,
            bc.ads,
            bc._is_converted,
            bc.customer_rank_label,
            bc.customer_type_label,
            bc.customer_types_label,
            bc.first_channel_label,
            bc.gioi_tinh_label,
            bc.name_value,
            bc.phone_value,
            bc.owner_name,
            bc.owner_id,
            bc.sale_name,
            bc.sale_id,
            bc.age_group_label,
            bc.place_of_issuance_label,
            bc.customer_care_employee_name,
            bc.passport_place_of_issuance_label,
            bc.database_created_at,
            bc.database_updated_at,
            bc.customer_opportunities,
            ( SELECT (element.value ->> 'group_source'::text)
                   FROM jsonb_array_elements(bc.source) element(value)
                  WHERE (element.value ? 'group_source'::text)
                 LIMIT 1) AS first_group_source
           FROM bizflycrm.customers bc
          WHERE (jsonb_typeof(bc.source) = 'array'::text)) _customers
  WHERE ((first_group_source = 'Call Center'::text) OR (first_group_source = 'Website jemmia.vn'::text) OR (first_group_source = 'Website'::text) OR ((first_group_source = 'Webhook Haravan'::text) AND ((first_channel_label)::text = 'FT - Khách vãng lai'::text)) OR (((customer_type_label)::text = 'Khách vãng lai'::text) OR ((customer_type_label)::text = 'HN - Khách vãng lai'::text) OR ((customer_type_label)::text = 'HCM - Khách vãng lai'::text) OR ((customer_type_label)::text = 'CT - Khách vãng lai'::text)))
  WITH NO DATA;


--
-- Name: departments; Type: TABLE; Schema: bizflycrm; Owner: -
--

CREATE TABLE bizflycrm.departments (
    uuid character varying(36) NOT NULL,
    id character varying(50),
    status character varying,
    _auto_id integer,
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    created_at_system timestamp without time zone,
    key character varying,
    numerical_order character varying,
    _first_time_assign_main_sale character varying,
    _first_time_assign_sale character varying,
    _last_time_assign_main_sale character varying,
    _last_time_assign_sale character varying,
    created_by jsonb,
    level_department jsonb,
    name jsonb,
    sale jsonb,
    list_sale jsonb,
    related_department_value character varying,
    name_value character varying,
    database_created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    database_updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: orders; Type: TABLE; Schema: bizflycrm; Owner: -
--

CREATE TABLE bizflycrm.orders (
    uuid character varying(36) NOT NULL,
    id character varying(50),
    _allocation_value numeric(36,8),
    _auto_id bigint,
    _first_time_assign_main_sale timestamp without time zone,
    _first_time_assign_sale timestamp without time zone,
    _last_note_time timestamp without time zone,
    _last_time_assign_main_sale timestamp without time zone,
    _last_time_assign_sale timestamp without time zone,
    _total_data_item integer,
    address1 character varying,
    allocated integer,
    bao_hanh jsonb,
    bonus_thanh_tien numeric(36,8),
    buyback_amount numeric(36,8),
    buyback_items jsonb,
    buyback_type jsonb,
    cancel_reason character varying,
    cancelled_at timestamp without time zone,
    cancelled_status jsonb,
    channel character varying,
    chiet_khau_san_pham numeric(36,8),
    chinh_sach_bao_hanh jsonb,
    city_name character varying,
    confirm_order character varying,
    consult_date timestamp without time zone,
    country_name character varying,
    ward_name character varying,
    created_at timestamp without time zone,
    created_at_system timestamp without time zone,
    customer jsonb,
    customer_type jsonb,
    da_thanh_toan numeric(36,8),
    delivered_date timestamp without time zone,
    delivery_location jsonb,
    delivery_locations jsonb,
    deposit_origination jsonb,
    district_name character varying,
    expected_delivery_date timestamp without time zone,
    expected_payment_date timestamp without time zone,
    financial_complete_date timestamp without time zone,
    financial_status jsonb,
    fulfillment_status jsonb,
    haravan_confirmed_by character varying(50),
    haravan_created_by character varying(50),
    haravan_id character varying(50),
    haravan_retailer character varying,
    is_bought_back character varying,
    link_blank character varying,
    location_name character varying,
    ngay_tao_tai_khoan timestamp without time zone,
    note text,
    order_amount numeric(36,8),
    order_channel jsonb,
    order_code character varying,
    order_created_on timestamp without time zone,
    order_data_item jsonb,
    order_discount numeric(36,8),
    order_left_amount numeric(36,8),
    order_paid_amount numeric(36,8),
    order_pretax numeric(36,8),
    order_promotion jsonb,
    order_status jsonb,
    order_tax numeric(36,8),
    order_type jsonb,
    original_order jsonb,
    paid_amount_percentage double precision,
    payload jsonb,
    payment_method_order jsonb,
    payment_status jsonb,
    phi_van_chuyen numeric(36,8),
    phieu_thu_mua jsonb,
    phone jsonb,
    phuong_thuc_thanh_toan jsonb,
    product_category jsonb,
    purpose jsonb,
    real_created_at timestamp without time zone,
    receipt_status jsonb,
    ref_order_date timestamp without time zone,
    ref_order_id character varying(50),
    ref_order_number character varying,
    ref_reward jsonb,
    rule_trigger jsonb,
    sale jsonb,
    sale_team jsonb,
    shipping_address_company character varying,
    shipping_address_name character varying,
    source jsonb,
    status character varying,
    tags jsonb,
    thoi_gian_giao_hang timestamp without time zone,
    tong_da_thanh_toan numeric(36,8),
    tong_gia_tri_don_hang numeric(36,8),
    tong_tien_hang numeric(36,8),
    total_discounts numeric(36,8),
    total_original_price numeric(36,8),
    updated_at timestamp without time zone,
    nguoi_gioi_thieu jsonb,
    bao_hanh_value character varying,
    cancelled_status_value character varying,
    customer_id character varying(50),
    customer_type_value character varying,
    delivery_location_value character varying,
    deposit_origination_value character varying,
    financial_status_value character varying,
    fulfillment_status_value character varying,
    order_channel_value character varying,
    order_status_value character varying,
    order_type_label character varying,
    order_type_value character varying,
    order_type_id character varying(50),
    original_order_value character varying,
    payment_method_order_value character varying,
    payment_status_value character varying,
    phone_value character varying,
    phone_hide character varying,
    phuong_thuc_thanh_toan_value character varying,
    purpose_label character varying,
    receipt_status_value character varying,
    ref_reward_value character varying,
    main_sale_id character varying(50),
    main_sale_name character varying,
    nguoi_gioi_thieu_id character varying(50),
    database_created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    database_updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    product_category_label character varying(255)
);


--
-- Name: erpnext_customer_view; Type: MATERIALIZED VIEW; Schema: bizflycrm; Owner: -
--

CREATE MATERIALIZED VIEW bizflycrm.erpnext_customer_view AS
 SELECT id,
    name_value,
    phone_value,
    ma_khach_hang,
    ma_kich_hoat,
    ngay_tao_tai_khoan,
    xung_ho,
    address1,
    district_name,
    haravan_id,
    country_name,
    ward_name,
    instagram_sender_id,
    zalo_sender_id,
    facebook_id_fp,
    facebook_sender_id,
    rd_gender,
    status,
    tags,
    tax_code,
    _date_sinh_nhat,
    is_merge_item,
    customer_rank_label,
    personal_id,
    customer_passport,
    date_of_issuance,
    place_of_issuance,
    passport_date_of_issuance,
    passport_place_of_issuance_label,
    sinh_nhat,
    place_of_issuance_label,
    customer_journey,
    bank_account_number,
    bank_address,
    bank_branch,
    rd_address,
    rd_tags,
    rd_conversation_id,
    rd_first_fb_message_time,
    rd_first_name,
    rd_first_support_assign_for,
    rd_full_name,
    rd_last_fb_message_messenger_time,
    rd_user_id,
    app_first_login_date,
    created_by,
    customer_care_employee,
    customer_care_employee_name,
    customer_related,
    rd_last_assign_for,
    customer_type_label,
    first_channel_label,
    gioi_tinh_label,
    sale_name,
    sale_id,
    city_name,
    company_name,
    lists,
    customer_opportunities
   FROM bizflycrm.customers bc
  WHERE ((id)::text IN ( SELECT DISTINCT orders.customer_id
           FROM bizflycrm.orders
          WHERE (((orders.order_code)::text <> ''::text) AND (orders.customer_id IS NOT NULL))))
  WITH NO DATA;


--
-- Name: kpis; Type: TABLE; Schema: bizflycrm; Owner: -
--

CREATE TABLE bizflycrm.kpis (
    uuid character varying(36) NOT NULL,
    id character varying(50),
    status character varying,
    _auto_id integer,
    created_at timestamp without time zone,
    created_at_system timestamp without time zone,
    start_time timestamp without time zone,
    end_time timestamp without time zone,
    updated_at timestamp without time zone,
    _first_time_assign_main_sale timestamp without time zone,
    _first_time_assign_sale timestamp without time zone,
    _last_time_assign_main_sale timestamp without time zone,
    _last_time_assign_sale timestamp without time zone,
    sale_team jsonb,
    created_by jsonb,
    description jsonb,
    name jsonb,
    sale jsonb,
    sale_used jsonb,
    _related_department jsonb,
    norm_data_item jsonb,
    sale_data_item jsonb,
    database_created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    database_updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: line_items; Type: TABLE; Schema: bizflycrm; Owner: -
--

CREATE TABLE bizflycrm.line_items (
    uuid character varying(36) NOT NULL,
    id character varying(50),
    order_id character varying(50),
    price_sale numeric(36,8),
    variant_id character varying,
    bien_the_san_pham character varying,
    barcode character varying,
    sku character varying,
    quantity bigint,
    item_name character varying,
    item_id character varying,
    applied_discount jsonb,
    invoice_discount jsonb,
    amount numeric(36,8),
    order_detail_diamond character varying,
    ten_sphd character varying,
    thong_tin_size_tam jsonb,
    purity jsonb,
    unit jsonb,
    setting_weight character varying,
    discount_percent double precision,
    discount_value numeric(36,8),
    setting_color jsonb,
    promotion jsonb,
    product_status jsonb,
    buyback_price numeric(36,8),
    item_code character varying,
    note character varying,
    product_name character varying,
    vat double precision,
    other_price numeric(36,8),
    chitiet_goidichvu jsonb,
    goi_dichvu jsonb,
    discount double precision,
    product_status_value character varying,
    promotion_value character varying,
    database_created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    database_updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    price numeric(36,8),
    serial_number jsonb,
    serial_number_value character varying,
    serial_number_id character varying
);


--
-- Name: orders_receipts; Type: TABLE; Schema: bizflycrm; Owner: -
--

CREATE TABLE bizflycrm.orders_receipts (
    uuid character varying(36) NOT NULL,
    id character varying(50),
    purchasing_order_erp_id character varying(50),
    customer jsonb,
    name jsonb,
    purchasing_types jsonb,
    purchasing_reason jsonb,
    purchasing_total numeric(36,8),
    purchasing_total_transfer numeric(36,8),
    purchasing_status jsonb,
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    thoi_gian_khach_ban_giao timestamp without time zone,
    chi_tiet_san_pham jsonb,
    created_at_system timestamp without time zone,
    status character varying,
    created_by jsonb,
    source jsonb,
    _auto_id bigint,
    "order" jsonb,
    purchasing_order_id jsonb,
    reference_order character varying,
    sale jsonb,
    total_exchange_value numeric(36,8),
    payload jsonb,
    customer_value character varying,
    customer_id character varying,
    name_value character varying,
    purchasing_types_label character varying,
    purchasing_reason_value character varying,
    purchasing_status_label character varying,
    order_name character varying,
    order_id character varying,
    purchasing_order_id_value character varying,
    purchasing_order_id_id character varying,
    sale_id character varying,
    sale_name character varying,
    database_created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    database_updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: payments; Type: TABLE; Schema: bizflycrm; Owner: -
--

CREATE TABLE bizflycrm.payments (
    uuid character varying(36) NOT NULL,
    id character varying(50),
    payment_amount numeric(36,8),
    payment_date timestamp without time zone,
    payment_method jsonb,
    "order" jsonb,
    customer jsonb,
    sale jsonb,
    sale_team jsonb,
    status character varying,
    _auto_id bigint,
    created_at timestamp without time zone,
    created_at_system timestamp without time zone,
    created_by jsonb,
    files jsonb,
    la_khoan_dat_coc_ jsonb,
    updated_at timestamp without time zone,
    _related_department jsonb,
    payload jsonb,
    order_id character varying(50),
    customer_id character varying(50),
    sale_id character varying(50),
    sale_name character varying(255),
    sale_team_id character varying(50),
    sale_team_value character varying(255),
    files_link character varying(255),
    la_khoan_dat_coc_label character varying(255),
    database_created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    database_updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: promotions; Type: TABLE; Schema: bizflycrm; Owner: -
--

CREATE TABLE bizflycrm.promotions (
    uuid character varying(36) NOT NULL,
    id character varying(50),
    status character varying(50),
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    created_at_system timestamp without time zone,
    created_by jsonb,
    discount_percentage double precision,
    promotion_description jsonb,
    sale jsonb,
    sale_team jsonb,
    type_of_promotion jsonb,
    customer jsonb,
    files jsonb,
    lists jsonb,
    name jsonb,
    priority_order jsonb,
    discount_group jsonb,
    discount_month jsonb,
    discount_duration jsonb,
    promotion_scope jsonb,
    discount_amount bigint,
    department jsonb,
    start_date timestamp without time zone,
    end_date timestamp without time zone,
    promotion_description_value text,
    sale_name character varying,
    type_of_promotion_value character varying,
    name_value character varying,
    priority_order_label character varying,
    discount_group_label character varying,
    discount_month_label character varying,
    discount_duration_label character varying,
    department_label character varying,
    promotion_scope_label character varying,
    database_created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    database_updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: promotions; Type: TABLE; Schema: erpnext; Owner: -
--

CREATE TABLE erpnext.promotions (
    uuid uuid NOT NULL,
    name character varying(255) NOT NULL,
    owner character varying(255),
    creation timestamp(6) without time zone,
    modified timestamp(6) without time zone,
    modified_by character varying(255),
    docstatus integer,
    idx integer,
    title character varying(255),
    scope character varying(255),
    is_active integer,
    is_expired integer,
    priority character varying(255),
    discount_type character varying(255),
    discount_amount numeric(18,6),
    discount_percent numeric(18,6),
    start_date date,
    end_date date,
    description text,
    bizfly_id character varying(255)
);


--
-- Name: sales_orders; Type: TABLE; Schema: erpnext; Owner: -
--

CREATE TABLE erpnext.sales_orders (
    uuid uuid NOT NULL,
    name text,
    owner text,
    creation timestamp(3) without time zone,
    modified timestamp(3) without time zone,
    modified_by text,
    docstatus integer,
    idx integer,
    title text,
    naming_series text,
    tax_id text,
    order_type text,
    skip_delivery_note integer,
    delivery_date timestamp(3) without time zone,
    po_no text,
    po_date timestamp(3) without time zone,
    company text,
    amended_from text,
    customer_name text,
    order_number text,
    transaction_date timestamp(3) without time zone,
    real_order_date timestamp(3) without time zone,
    cancelled_status text,
    financial_status text,
    fulfillment_status text,
    expected_delivery_date timestamp(3) without time zone,
    cost_center text,
    project text,
    currency text,
    conversion_rate double precision,
    selling_price_list text,
    price_list_currency text,
    plc_conversion_rate double precision,
    ignore_pricing_rule integer,
    scan_barcode text,
    set_warehouse text,
    reserve_stock integer,
    apply_discount_on text,
    base_discount_amount numeric(18,6),
    coupon_code text,
    additional_discount_percentage numeric(18,6),
    total_qty integer,
    total numeric(18,6),
    discount_amount numeric(18,6),
    grand_total numeric(18,6),
    base_total numeric(18,6),
    base_net_total numeric(18,6),
    total_net_weight numeric(18,6),
    net_total numeric(18,6),
    tax_category text,
    taxes_and_charges text,
    shipping_rule text,
    incoterm text,
    named_place text,
    base_total_taxes_and_charges numeric(18,6),
    total_taxes_and_charges numeric(18,6),
    base_grand_total numeric(18,6),
    base_rounding_adjustment numeric(18,6),
    base_rounded_total numeric(18,6),
    base_in_words text,
    rounding_adjustment numeric(18,6),
    rounded_total numeric(18,6),
    in_words text,
    advance_paid numeric(18,6),
    disable_rounded_total integer,
    other_charges_calculation text,
    contact_person text,
    contact_display text,
    contact_phone text,
    contact_mobile text,
    contact_email text,
    customer_address text,
    address_display text,
    customer_group text,
    territory text,
    shipping_address_name text,
    shipping_address text,
    customer text,
    gender text,
    customer_type text,
    customer_personal_id text,
    birth_date timestamp(3) without time zone,
    date_of_issuance timestamp(3) without time zone,
    dispatch_address text,
    place_of_issuance text,
    dispatch_address_name text,
    company_address text,
    company_address_display text,
    company_contact_person text,
    status text,
    delivery_status text,
    per_delivered numeric(18,6),
    per_billed numeric(18,6),
    per_picked numeric(18,6),
    billing_status text,
    sales_partner text,
    amount_eligible_for_commission numeric(18,6),
    commission_rate numeric(18,6),
    total_commission numeric(18,6),
    loyalty_points integer,
    loyalty_amount numeric(18,6),
    from_date timestamp(3) without time zone,
    to_date timestamp(3) without time zone,
    auto_repeat text,
    letter_head text,
    group_same_items integer,
    select_print_heading text,
    language text,
    is_internal_customer integer,
    represents_company text,
    source text,
    inter_company_order_reference text,
    campaign text,
    party_account_currency text,
    total_amount numeric(18,6),
    expected_payment_date timestamp(3) without time zone,
    paid_amount numeric(18,6),
    balance numeric(18,6),
    payment_terms_template text,
    tc_name text,
    terms text,
    haravan_order_id text,
    haravan_ref_order_id text,
    haravan_created_at timestamp(3) without time zone,
    source_name text,
    sales_team jsonb,
    ref_sales_orders jsonb,
    promotions jsonb,
    product_categories jsonb,
    packed_items jsonb,
    taxes jsonb,
    pricing_rules jsonb,
    payment_records jsonb,
    payment_schedule jsonb,
    policies jsonb,
    items jsonb,
    database_created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP,
    database_updated_at timestamp(6) without time zone,
    consultation_date date,
    primary_sales_person text,
    sales_order_purposes jsonb,
    debt_histories jsonb
);


--
-- Name: promotion_order_data_item_view; Type: MATERIALIZED VIEW; Schema: bizflycrm; Owner: -
--

CREATE MATERIALIZED VIEW bizflycrm.promotion_order_data_item_view AS
 SELECT bo.id,
    bo.haravan_id,
    bo.order_code,
    COALESCE(bo.real_created_at, bo.order_created_on) AS real_created_at,
    bo.order_created_on,
    bo.updated_at,
    (order_data_item_element.value ->> '_id'::text) AS item_id,
    (order_data_item_element.value ->> 'item_name'::text) AS item_name,
    (order_data_item_element.value ->> 'variant_id'::text) AS variant_id,
    (order_data_item_element.value ->> 'sku'::text) AS sku,
    (order_data_item_element.value ->> 'quantity'::text) AS quantity,
    (order_data_item_element.value ->> 'price'::text) AS original_price,
    (order_data_item_element.value ->> 'amount'::text) AS final_price,
    (promotion_order_data_item_element.value ->> 'id'::text) AS promotion_id,
    bp.promotion_scope_label,
    bp.promotion_description_value,
    bp.discount_group_label,
    bp.discount_percentage,
    bp.discount_amount,
    bp.name_value AS promotion_name,
    bp.type_of_promotion_value,
    (regexp_replace((bp.priority_order_label)::text, '[^0-9]'::text, ''::text, 'g'::text))::integer AS priority,
    bp.discount_duration_label,
    row_number() OVER (PARTITION BY bo.id, (order_data_item_element.value ->> '_id'::text) ORDER BY (regexp_replace((bp.priority_order_label)::text, '[^0-9]'::text, ''::text, 'g'::text))::integer, bp.discount_percentage DESC, bp.discount_amount DESC) AS promotion_priority,
    'bizflycrm'::text AS source
   FROM (((bizflycrm.orders bo
     LEFT JOIN LATERAL jsonb_array_elements(bo.order_data_item) order_data_item_element(value) ON (true))
     LEFT JOIN LATERAL jsonb_array_elements(
        CASE
            WHEN (jsonb_typeof((order_data_item_element.value -> 'promotion'::text)) = 'array'::text) THEN (order_data_item_element.value -> 'promotion'::text)
            ELSE '[]'::jsonb
        END) promotion_order_data_item_element(value) ON (true))
     LEFT JOIN bizflycrm.promotions bp ON (((((bp.id)::text = (promotion_order_data_item_element.value ->> 'id'::text)) AND ((promotion_order_data_item_element.value ->> 'id'::text) IS NOT NULL)) OR ((order_data_item_element.value -> 'promotion'::text) IS NULL))))
  WHERE (((jsonb_typeof(bo.order_data_item) = 'array'::text) OR (bo.order_data_item IS NULL)) AND ((order_data_item_element.value ->> 'quantity'::text) <> '0'::text) AND (bo.haravan_id IS NOT NULL) AND ((bo.haravan_id)::text <> ''::text) AND ((bo.haravan_id)::text < '1729061797'::text))
UNION ALL
 SELECT bo.id,
    eso.haravan_order_id AS haravan_id,
    eso.order_number AS order_code,
    COALESCE(eso.real_order_date, eso.creation) AS real_created_at,
    eso.creation AS order_created_on,
    eso.modified AS updated_at,
    (sales_order_items.value ->> 'name'::text) AS item_id,
    (sales_order_items.value ->> 'variant_title'::text) AS item_name,
    (sales_order_items.value ->> 'haravan_variant_id'::text) AS variant_id,
    (sales_order_items.value ->> 'sku'::text) AS sku,
    (sales_order_items.value ->> 'stock_qty'::text) AS quantity,
    (sales_order_items.value ->> 'price_list_rate'::text) AS original_price,
    (sales_order_items.value ->> 'amount'::text) AS final_price,
    unnested.promotions AS promotion_id,
        CASE ep.scope
            WHEN 'Order'::text THEN 'Đơn hàng'::text
            WHEN 'Line Item'::text THEN 'Sản phẩm'::text
            ELSE ''::text
        END AS promotion_scope_label,
    ep.title AS promotion_description_value,
    ''::character varying AS discount_group_label,
    ep.discount_percent AS discount_percentage,
    ep.discount_amount,
    ''::character varying AS promotion_name,
    ''::character varying AS type_of_promotion_value,
    (regexp_replace((COALESCE(ep.priority, '0'::character varying))::text, '[^0-9]'::text, ''::text, 'g'::text))::integer AS priority,
    ''::character varying AS discount_duration_label,
    unnested.promotion_priority,
    'erpnext'::text AS source
   FROM ((((erpnext.sales_orders eso
     LEFT JOIN LATERAL jsonb_array_elements(eso.items) sales_order_items(value) ON (true))
     CROSS JOIN LATERAL ( SELECT t.promo,
            t.priority
           FROM UNNEST(ARRAY[(sales_order_items.value ->> 'promotion_1'::text), (sales_order_items.value ->> 'promotion_2'::text), (sales_order_items.value ->> 'promotion_3'::text), (sales_order_items.value ->> 'promotion_4'::text)], ARRAY[1, 2, 3, 4]) t(promo, priority)
          WHERE (t.promo IS NOT NULL)
        UNION ALL
         SELECT NULL::text AS text,
            1
          WHERE (((sales_order_items.value ->> 'promotion_1'::text) IS NULL) AND ((sales_order_items.value ->> 'promotion_2'::text) IS NULL) AND ((sales_order_items.value ->> 'promotion_3'::text) IS NULL) AND ((sales_order_items.value ->> 'promotion_4'::text) IS NULL))) unnested(promotions, promotion_priority))
     LEFT JOIN erpnext.promotions ep ON (((ep.name)::text = unnested.promotions)))
     LEFT JOIN bizflycrm.orders bo ON (((bo.haravan_id)::text = eso.haravan_order_id)))
  WHERE (eso.order_number >= 'ORDER112446'::text)
  WITH NO DATA;


--
-- Name: promotion_order_view; Type: MATERIALIZED VIEW; Schema: bizflycrm; Owner: -
--

CREATE MATERIALIZED VIEW bizflycrm.promotion_order_view AS
 SELECT bo.id,
    bo.haravan_id,
    bo.order_code,
    COALESCE(bo.real_created_at, bo.order_created_on) AS real_created_at,
    bo.order_created_on,
    bo.tong_tien_hang,
    bo.tong_gia_tri_don_hang,
    bo.updated_at,
    (promotion_order_element.value ->> 'id'::text) AS promotion_id,
    bp.promotion_scope_label,
    bp.promotion_description_value,
    bp.discount_group_label,
    bp.discount_percentage,
    bp.discount_amount,
    bp.name_value AS promotion_name,
    bp.type_of_promotion_value,
    (regexp_replace((bp.priority_order_label)::text, '[^0-9]'::text, ''::text, 'g'::text))::integer AS priority,
    bp.discount_duration_label,
    row_number() OVER (PARTITION BY bo.id, (promotion_order_element.value ->> '_id'::text) ORDER BY (regexp_replace((bp.priority_order_label)::text, '[^0-9]'::text, ''::text, 'g'::text))::integer, bp.discount_percentage DESC, bp.discount_amount DESC) AS promotion_priority
   FROM ((bizflycrm.orders bo
     LEFT JOIN LATERAL jsonb_array_elements(
        CASE
            WHEN (jsonb_typeof(bo.order_promotion) = 'array'::text) THEN bo.order_promotion
            ELSE '[]'::jsonb
        END) promotion_order_element(value) ON (true))
     LEFT JOIN bizflycrm.promotions bp ON ((((bp.id)::text = (promotion_order_element.value ->> 'id'::text)) AND ((promotion_order_element.value ->> 'id'::text) IS NOT NULL))))
  WHERE (((bo.haravan_id IS NOT NULL) OR ((bo.haravan_id)::text <> ''::text)) AND (((promotion_order_element.value ->> 'id'::text) <> '677cb57fbe587006750fcb49'::text) OR ((promotion_order_element.value ->> 'id'::text) IS NULL)) AND ((bo.haravan_id IS NULL) OR ((bo.haravan_id)::text = 'None'::text) OR ((bo.haravan_id)::text = ''::text) OR ((bo.haravan_id)::bigint IS NULL)) AND (bo.order_created_on < '2025-09-30 00:00:00'::timestamp without time zone))
UNION
 SELECT bo.id,
    eso.haravan_order_id AS haravan_id,
    eso.order_number AS order_code,
    COALESCE(eso.real_order_date, eso.creation) AS real_created_at,
    eso.creation AS order_created_on,
    eso.grand_total AS tong_tien_hang,
    eso.total AS tong_gia_tri_don_hang,
    eso.modified AS updated_at,
    (promotion.value ->> 'promotion'::text) AS promotion_id,
        CASE
            WHEN ((ep.scope)::text = 'Order'::text) THEN 'Đơn hàng'::text
            WHEN ((ep.scope)::text = 'Line Item'::text) THEN 'Sản phẩm'::text
            ELSE ''::text
        END AS promotion_scope_label,
    ep.title AS promotion_description_value,
    ''::character varying AS discount_group_label,
    ep.discount_percent AS discount_percentage,
    ep.discount_amount,
    ''::character varying AS promotion_name,
    ''::character varying AS type_of_promotion_value,
    (regexp_replace((ep.priority)::text, '[^0-9]'::text, ''::text, 'g'::text))::integer AS priority,
    ''::character varying AS discount_duration_label,
    row_number() OVER (PARTITION BY eso.name, (promotion.value ->> '_id'::text) ORDER BY (regexp_replace((ep.priority)::text, '[^0-9]'::text, ''::text, 'g'::text))::integer, ep.discount_percent DESC, ep.discount_amount DESC) AS promotion_priority
   FROM (((erpnext.sales_orders eso
     LEFT JOIN LATERAL jsonb_array_elements(eso.promotions) promotion(value) ON (true))
     LEFT JOIN erpnext.promotions ep ON (((ep.name)::text = (promotion.value ->> 'promotion'::text))))
     LEFT JOIN bizflycrm.orders bo ON (((bo.haravan_id)::text = eso.haravan_order_id)))
  WHERE ((eso.haravan_order_id)::bigint >= 1729061797)
  WITH NO DATA;


--
-- Name: serial_numbers; Type: TABLE; Schema: bizflycrm; Owner: -
--

CREATE TABLE bizflycrm.serial_numbers (
    uuid character varying(36) NOT NULL,
    id character varying(50),
    customer jsonb,
    status character varying,
    _auto_id bigint,
    availability jsonb,
    created_at timestamp without time zone,
    created_at_system timestamp without time zone,
    created_by jsonb,
    serial_number character varying(50),
    updated_at timestamp without time zone,
    sale jsonb,
    sale_team jsonb,
    _first_time_assign_main_sale timestamp without time zone,
    _first_time_assign_sale timestamp without time zone,
    _last_time_assign_main_sale timestamp without time zone,
    _last_time_assign_sale timestamp without time zone,
    sku character varying(50),
    sub_sku character varying(50),
    availability_value character varying(50),
    database_created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    database_updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: users; Type: TABLE; Schema: bizflycrm; Owner: -
--

CREATE TABLE bizflycrm.users (
    uuid character varying(36) NOT NULL,
    id character varying(50),
    project_id character varying,
    member_id character varying,
    name character varying,
    status character varying,
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    email character varying,
    line integer,
    phone character varying,
    member jsonb,
    my_id character varying,
    is_root integer,
    blocked_by character varying,
    stringee character varying,
    vcc_call_center_hotline character varying,
    vcc_call_center_number character varying,
    group_role jsonb,
    group_role_new jsonb,
    selected_line jsonb,
    database_created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    database_updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: crm_leads; Type: MATERIALIZED VIEW; Schema: conversation_rate; Owner: -
--

CREATE MATERIALIZED VIEW conversation_rate.crm_leads AS
 SELECT id,
    id AS customer_id,
    'OTHER'::text AS type,
    first_group_source AS page_id,
        CASE
            WHEN (phone_value IS NOT NULL) THEN true
            ELSE false
        END AS has_phone,
    NULL::text AS post_id,
    sale_id AS added_user_id,
    sale_name AS added_user_name,
        CASE
            WHEN (first_group_source = 'Call Center'::text) THEN 'Call Center'::text
            WHEN (first_group_source = 'Website jemmia.vn'::text) THEN 'Form Website'::text
            WHEN ((first_group_source = 'Webhook Haravan'::text) AND ((first_channel_label)::text = 'FT - Khách vãng lai'::text)) THEN 'Khách Vãng Lai'::text
            ELSE 'Khác'::text
        END AS name,
    NULL::text AS platform,
    created_at AS inserted_at,
    name_value AS customer_name,
    phone_value AS phone,
    'bizflycrm'::text AS source
   FROM bizflycrm.custom_lead_view bc
  WITH NO DATA;


--
-- Name: conversation; Type: TABLE; Schema: pancake; Owner: -
--

CREATE TABLE pancake.conversation (
    uuid character varying NOT NULL,
    id character varying,
    customer_id character varying,
    type character varying,
    inserted_at timestamp without time zone,
    page_id character varying,
    has_phone boolean,
    post_id character varying,
    database_created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    database_updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    assignee_histories jsonb,
    added_users jsonb,
    added_user_id character varying,
    added_user_name character varying,
    added_user_email character varying,
    added_user_fb_id character varying,
    updated_at timestamp without time zone,
    last_sent_at timestamp without time zone,
    avatar_url character varying,
    ad_ids jsonb
);


--
-- Name: page; Type: TABLE; Schema: pancake; Owner: -
--

CREATE TABLE pancake.page (
    uuid character varying NOT NULL,
    id character varying,
    inserted_at timestamp without time zone,
    connected boolean,
    is_activated boolean,
    name character varying,
    platform character varying,
    timezone character varying,
    settings jsonb,
    platform_extra_info jsonb,
    database_created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    database_updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    page_access_token character varying(255)
);


--
-- Name: page_customer; Type: TABLE; Schema: pancake; Owner: -
--

CREATE TABLE pancake.page_customer (
    uuid character varying NOT NULL,
    id character varying,
    birthday character varying,
    can_inbox boolean,
    customer_id character varying,
    gender character varying,
    inserted_at timestamp without time zone,
    lives_in character varying,
    name character varying,
    page_id character varying,
    database_created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    database_updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    phone_numbers jsonb,
    notes jsonb,
    phone character varying(255),
    updated_at timestamp without time zone
);


--
-- Name: pancake_leads; Type: MATERIALIZED VIEW; Schema: conversation_rate; Owner: -
--

CREATE MATERIALIZED VIEW conversation_rate.pancake_leads AS
 SELECT pc.id,
    pc.customer_id,
    pc.type,
    pc.page_id,
    pc.has_phone,
    pc.post_id,
    COALESCE(pc.added_user_id, (
        CASE
            WHEN ((pp.platform)::text = 'personal_zalo'::text) THEN mapping_table.added_user_id
            ELSE NULL::text
        END)::character varying) AS added_user_id,
    COALESCE(pc.added_user_name, (
        CASE
            WHEN ((pp.platform)::text = 'personal_zalo'::text) THEN mapping_table.added_user_name
            ELSE NULL::text
        END)::character varying) AS added_user_name,
    pp.name,
    pp.platform,
    pc.inserted_at,
    ppc.name AS customer_name,
    ppc.phone,
    'pancake'::text AS source
   FROM (((pancake.conversation pc
     LEFT JOIN pancake.page pp ON (((pc.page_id)::text = (pp.id)::text)))
     LEFT JOIN pancake.page_customer ppc ON (((pc.customer_id)::text = (ppc.customer_id)::text)))
     LEFT JOIN ( VALUES ('Thương Jemmia'::text,'32a9f86d-b6d4-4ff8-8161-8b9aab87ca19'::text,'Nguyễn Đặng Hoài  Thương'::text), ('Thuỳ Duyên Diamond'::text,'ad2161b0-2eda-47e8-b48a-7007273f35e3'::text,'Nhan Phát Thùy Duyên'::text), ('Saly Jemmia'::text,'66e32e3c-c259-4dea-a922-1ea4e1ed5ead'::text,'Saly Phé'::text), ('Linh Jemmia Diamond'::text,'36b83933-dd44-4414-9a01-381ff661483f'::text,'Phan Thùy Linh'::text), ('Hà Jemmia'::text,'d00cfa8f-604a-4783-b6ea-9514b683596c'::text,'Hà Trần Thanh'::text), ('Vy Jemmia'::text,'befec127-abea-45d2-a477-40d84ba1a078'::text,'Lương Thị Hồng Vy'::text), ('Huy Jemmia Diamond'::text,'02683e29-fd30-4441-bf43-92fc6967cfb3'::text,'Trần Đỗ Bảo Huy'::text), ('Kim Xuyến Jemmia'::text,'mapped_user_3'::text,'Kim Xuyến'::text), ('Bội Jemmia'::text,'2c151dd7-c306-4dc2-bece-0a9bebcb236a'::text,'Bội Phân Tsai'::text), ('Quyển Jemmia'::text,'cd435563-597e-4fb5-b050-685dd43acee3'::text,'Đặng Ngọc Huỳnh Quyển'::text), ('Vân Anh Jemmia Diamond'::text,'9c9b001b-ebbb-47db-8cdb-3d9347c4cdaa'::text,'Lư  Trần Vân Anh'::text), ('Duyên Phạm Jemmia'::text,'73c6aa2a-be0b-4443-967b-b24a8f2ea139'::text,'Phạm Thị Mỹ Duyên'::text), ('Trang Jemmia Diamond'::text,'0810b50f-d271-421e-bc93-7940098e044b'::text,'Dang Thuy Trang '::text)) mapping_table(name, added_user_id, added_user_name) ON ((((pp.platform)::text = 'personal_zalo'::text) AND ((pp.name)::text = mapping_table.name))))
  WITH NO DATA;


--
-- Name: leads; Type: MATERIALIZED VIEW; Schema: conversation_rate; Owner: -
--

CREATE MATERIALIZED VIEW conversation_rate.leads AS
 SELECT pancake_leads.id,
    pancake_leads.customer_id,
    pancake_leads.type,
    pancake_leads.page_id,
    pancake_leads.has_phone,
    pancake_leads.post_id,
    pancake_leads.added_user_id,
    pancake_leads.added_user_name,
    pancake_leads.name,
    pancake_leads.platform,
    pancake_leads.inserted_at,
    pancake_leads.customer_name,
    pancake_leads.phone,
    pancake_leads.source
   FROM conversation_rate.pancake_leads
UNION
 SELECT crm_leads.id,
    crm_leads.customer_id,
    crm_leads.type,
    crm_leads.page_id,
    crm_leads.has_phone,
    crm_leads.post_id,
    crm_leads.added_user_id,
    crm_leads.added_user_name,
    crm_leads.name,
    crm_leads.platform,
    crm_leads.inserted_at,
    crm_leads.customer_name,
    crm_leads.phone,
    crm_leads.source
   FROM conversation_rate.crm_leads
  WITH NO DATA;


--
-- Name: orders; Type: TABLE; Schema: haravan; Owner: -
--

CREATE TABLE haravan.orders (
    uuid character varying(36) NOT NULL,
    id integer,
    billing_address_id bigint,
    billing_address_address1 character varying,
    billing_address_address2 character varying,
    billing_address_city character varying,
    billing_address_company character varying,
    billing_address_country character varying,
    billing_address_first_name character varying,
    billing_address_last_name character varying,
    billing_address_phone character varying,
    billing_address_province character varying,
    billing_address_zip character varying,
    billing_address_name character varying,
    billing_address_province_code character varying,
    billing_address_country_code character varying,
    billing_address_default boolean,
    billing_address_district character varying,
    billing_address_district_code character varying,
    billing_address_ward character varying,
    billing_address_ward_code character varying,
    browser_ip character varying,
    buyer_accepts_marketing boolean,
    cancel_reason character varying,
    cancelled_at timestamp without time zone,
    cart_token character varying,
    checkout_token character varying,
    client_details_accept_language character varying,
    client_details_browser_height bigint,
    client_details_browser_width bigint,
    client_details_session_hash character varying,
    client_details_user_agent character varying,
    client_details_browser_ip character varying,
    closed_at timestamp without time zone,
    created_at timestamp without time zone,
    currency character varying,
    customer_id bigint,
    customer_email character varying,
    customer_phone character varying,
    customer_first_name character varying,
    customer_last_name character varying,
    customer_multipass_identifier character varying,
    customer_last_order_id bigint,
    customer_last_order_name character varying,
    customer_note text,
    customer_order_count integer,
    customer_state character varying,
    customer_tags character varying,
    customer_total_spent numeric(36,8),
    customer_updated_at timestamp without time zone,
    customer_verified_email boolean,
    customer_send_email_invite boolean,
    customer_send_email_welcome boolean,
    customer_password character varying,
    customer_password_confirmation character varying,
    customer_group_name character varying,
    customer_birthday character varying,
    customer_gender character varying,
    customer_last_order_date timestamp without time zone,
    customer_default_address_id bigint,
    customer_default_address_address1 character varying,
    customer_default_address_address2 character varying,
    customer_default_address_city character varying,
    customer_default_address_company character varying,
    customer_default_address_country character varying,
    customer_default_address_province character varying,
    customer_default_address_first_name character varying,
    customer_default_address_last_name character varying,
    customer_default_address_phone character varying,
    customer_default_address_province_code character varying,
    customer_default_address_country_code character varying,
    customer_default_address_default boolean,
    customer_default_address_district character varying,
    customer_default_address_district_code character varying,
    customer_default_address_ward character varying,
    customer_default_address_ward_code character varying,
    discount_codes jsonb,
    email character varying,
    financial_status character varying,
    fulfillment_status character varying,
    tags character varying,
    gateway character varying,
    gateway_code character varying,
    landing_site character varying,
    landing_site_ref character varying,
    source character varying,
    name character varying,
    note text,
    number integer,
    order_number character varying,
    processing_method character varying,
    shipping_address_address1 character varying,
    shipping_address_address2 character varying,
    shipping_address_city character varying,
    shipping_address_company character varying,
    shipping_address_country character varying,
    shipping_address_first_name character varying,
    shipping_address_last_name character varying,
    shipping_address_latitude double precision,
    shipping_address_longitude double precision,
    shipping_address_phone character varying,
    shipping_address_province character varying,
    shipping_address_zip character varying,
    shipping_address_name character varying,
    shipping_address_province_code character varying,
    shipping_address_country_code character varying,
    shipping_address_district_code character varying,
    shipping_address_district character varying,
    shipping_address_ward_code character varying,
    shipping_address_ward character varying,
    shipping_lines jsonb,
    source_name character varying,
    subtotal_price numeric(36,8),
    tax_lines character varying,
    taxes_included boolean,
    token character varying,
    total_discounts numeric(36,8),
    total_line_items_price numeric(36,8),
    total_price numeric(36,8),
    total_tax numeric(36,8),
    total_weight double precision,
    updated_at timestamp without time zone,
    note_attributes jsonb,
    confirmed_at timestamp without time zone,
    closed_status character varying,
    cancelled_status character varying,
    confirmed_status character varying,
    assigned_location_id bigint,
    assigned_location_name character varying,
    assigned_location_at timestamp without time zone,
    exported_confirm_at timestamp without time zone,
    user_id bigint,
    device_id bigint,
    location_id bigint,
    location_name character varying,
    ref_order_id bigint,
    ref_order_date timestamp without time zone,
    ref_order_number character varying,
    utm_source character varying,
    utm_medium character varying,
    utm_campaign character varying,
    utm_term character varying,
    utm_content character varying,
    payment_url character varying,
    contact_email character varying,
    order_processing_status character varying,
    prev_order_id bigint,
    prev_order_number character varying,
    prev_order_date timestamp without time zone,
    redeem_model character varying,
    confirm_user bigint,
    risk_level character varying,
    discount_applications jsonb,
    database_created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    database_updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: lead_orders; Type: MATERIALIZED VIEW; Schema: conversation_rate; Owner: -
--

CREATE MATERIALIZED VIEW conversation_rate.lead_orders AS
 WITH rankedrecords AS (
         SELECT cl.id AS conversation_id,
            ho.id AS order_id,
            ho.order_number,
            ho.total_price,
            cl.inserted_at,
            haravan.get_real_created_at(ho.id) AS real_created_at,
            row_number() OVER (PARTITION BY ho.id ORDER BY cl.inserted_at) AS row_num
           FROM (conversation_rate.leads cl
             JOIN ( SELECT hoo.uuid,
                    hoo.id,
                    hoo.billing_address_id,
                    hoo.billing_address_address1,
                    hoo.billing_address_address2,
                    hoo.billing_address_city,
                    hoo.billing_address_company,
                    hoo.billing_address_country,
                    hoo.billing_address_first_name,
                    hoo.billing_address_last_name,
                    hoo.billing_address_phone,
                    hoo.billing_address_province,
                    hoo.billing_address_zip,
                    hoo.billing_address_name,
                    hoo.billing_address_province_code,
                    hoo.billing_address_country_code,
                    hoo.billing_address_default,
                    hoo.billing_address_district,
                    hoo.billing_address_district_code,
                    hoo.billing_address_ward,
                    hoo.billing_address_ward_code,
                    hoo.browser_ip,
                    hoo.buyer_accepts_marketing,
                    hoo.cancel_reason,
                    hoo.cancelled_at,
                    hoo.cart_token,
                    hoo.checkout_token,
                    hoo.client_details_accept_language,
                    hoo.client_details_browser_height,
                    hoo.client_details_browser_width,
                    hoo.client_details_session_hash,
                    hoo.client_details_user_agent,
                    hoo.client_details_browser_ip,
                    hoo.closed_at,
                    hoo.created_at,
                    hoo.currency,
                    hoo.customer_id,
                    hoo.customer_email,
                    hoo.customer_phone,
                    hoo.customer_first_name,
                    hoo.customer_last_name,
                    hoo.customer_multipass_identifier,
                    hoo.customer_last_order_id,
                    hoo.customer_last_order_name,
                    hoo.customer_note,
                    hoo.customer_order_count,
                    hoo.customer_state,
                    hoo.customer_tags,
                    hoo.customer_total_spent,
                    hoo.customer_updated_at,
                    hoo.customer_verified_email,
                    hoo.customer_send_email_invite,
                    hoo.customer_send_email_welcome,
                    hoo.customer_password,
                    hoo.customer_password_confirmation,
                    hoo.customer_group_name,
                    hoo.customer_birthday,
                    hoo.customer_gender,
                    hoo.customer_last_order_date,
                    hoo.customer_default_address_id,
                    hoo.customer_default_address_address1,
                    hoo.customer_default_address_address2,
                    hoo.customer_default_address_city,
                    hoo.customer_default_address_company,
                    hoo.customer_default_address_country,
                    hoo.customer_default_address_province,
                    hoo.customer_default_address_first_name,
                    hoo.customer_default_address_last_name,
                    hoo.customer_default_address_phone,
                    hoo.customer_default_address_province_code,
                    hoo.customer_default_address_country_code,
                    hoo.customer_default_address_default,
                    hoo.customer_default_address_district,
                    hoo.customer_default_address_district_code,
                    hoo.customer_default_address_ward,
                    hoo.customer_default_address_ward_code,
                    hoo.discount_codes,
                    hoo.email,
                    hoo.financial_status,
                    hoo.fulfillment_status,
                    hoo.tags,
                    hoo.gateway,
                    hoo.gateway_code,
                    hoo.landing_site,
                    hoo.landing_site_ref,
                    hoo.source,
                    hoo.name,
                    hoo.note,
                    hoo.number,
                    hoo.order_number,
                    hoo.processing_method,
                    hoo.shipping_address_address1,
                    hoo.shipping_address_address2,
                    hoo.shipping_address_city,
                    hoo.shipping_address_company,
                    hoo.shipping_address_country,
                    hoo.shipping_address_first_name,
                    hoo.shipping_address_last_name,
                    hoo.shipping_address_latitude,
                    hoo.shipping_address_longitude,
                    hoo.shipping_address_phone,
                    hoo.shipping_address_province,
                    hoo.shipping_address_zip,
                    hoo.shipping_address_name,
                    hoo.shipping_address_province_code,
                    hoo.shipping_address_country_code,
                    hoo.shipping_address_district_code,
                    hoo.shipping_address_district,
                    hoo.shipping_address_ward_code,
                    hoo.shipping_address_ward,
                    hoo.shipping_lines,
                    hoo.source_name,
                    hoo.subtotal_price,
                    hoo.tax_lines,
                    hoo.taxes_included,
                    hoo.token,
                    hoo.total_discounts,
                    hoo.total_line_items_price,
                    hoo.total_price,
                    hoo.total_tax,
                    hoo.total_weight,
                    hoo.updated_at,
                    hoo.note_attributes,
                    hoo.confirmed_at,
                    hoo.closed_status,
                    hoo.cancelled_status,
                    hoo.confirmed_status,
                    hoo.assigned_location_id,
                    hoo.assigned_location_name,
                    hoo.assigned_location_at,
                    hoo.exported_confirm_at,
                    hoo.user_id,
                    hoo.device_id,
                    hoo.location_id,
                    hoo.location_name,
                    hoo.ref_order_id,
                    hoo.ref_order_date,
                    hoo.ref_order_number,
                    hoo.utm_source,
                    hoo.utm_medium,
                    hoo.utm_campaign,
                    hoo.utm_term,
                    hoo.utm_content,
                    hoo.payment_url,
                    hoo.contact_email,
                    hoo.order_processing_status,
                    hoo.prev_order_id,
                    hoo.prev_order_number,
                    hoo.prev_order_date,
                    hoo.redeem_model,
                    hoo.confirm_user,
                    hoo.risk_level,
                    hoo.discount_applications,
                    hoo.database_created_at,
                    hoo.database_updated_at
                   FROM haravan.orders hoo
                  WHERE ((((hoo.source)::text !~~ '%bhsc%'::text) OR ((hoo.source)::text = ANY ((ARRAY['harafunnel'::character varying, 'sendo'::character varying])::text[]))) AND ((hoo.cancelled_status)::text = 'uncancelled'::text) AND ((hoo.confirmed_status)::text = 'confirmed'::text))) ho ON (((cl.phone)::text = (ho.customer_phone)::text)))
        )
 SELECT conversation_id,
    order_id,
    order_number,
    total_price,
    inserted_at,
    real_created_at,
    row_num
   FROM rankedrecords
  WHERE ((row_num = 1) AND (inserted_at < real_created_at))
  WITH NO DATA;


--
-- Name: conversation_tag; Type: TABLE; Schema: pancake; Owner: -
--

CREATE TABLE pancake.conversation_tag (
    uuid character varying,
    conversation_id character varying NOT NULL,
    page_id character varying,
    customer_id character varying,
    inserted_at timestamp without time zone NOT NULL,
    post_id character varying,
    has_phone boolean,
    tag_page_id integer NOT NULL,
    tag_label character varying,
    tag_description character varying,
    action character varying NOT NULL,
    database_created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    database_updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: tags; Type: MATERIALIZED VIEW; Schema: conversation_rate; Owner: -
--

CREATE MATERIALIZED VIEW conversation_rate.tags AS
 SELECT uuid,
    conversation_id,
    page_id,
    customer_id,
    inserted_at,
    post_id,
    has_phone,
    tag_page_id,
    tag_label,
    tag_description,
    action,
    database_created_at,
    database_updated_at
   FROM pancake.conversation_tag t1
  WHERE (((action)::text = 'add'::text) AND (NOT (EXISTS ( SELECT 1
           FROM pancake.conversation_tag t2
          WHERE (((t2.conversation_id)::text = (t1.conversation_id)::text) AND (t2.tag_page_id = t1.tag_page_id) AND (t2.inserted_at > t1.inserted_at))))))
  WITH NO DATA;


--
-- Name: tag_order_leads; Type: MATERIALIZED VIEW; Schema: conversation_rate; Owner: -
--

CREATE MATERIALIZED VIEW conversation_rate.tag_order_leads AS
 WITH lead_orders AS (
         SELECT lead_orders.conversation_id,
            lead_orders.order_id,
            lead_orders.order_number,
            lead_orders.total_price,
            lead_orders.real_created_at,
            lead_orders.row_num
           FROM conversation_rate.lead_orders
        ), lead_tags AS (
         SELECT tags.conversation_id,
            tags.tag_page_id,
            tags.tag_label,
            tags.inserted_at AS tag_inserted_at
           FROM conversation_rate.tags
        ), tag_aggregation AS (
         SELECT tags.conversation_id,
            array_agg(DISTINCT tags.tag_label) AS _tag_label
           FROM conversation_rate.tags
          GROUP BY tags.conversation_id
        )
 SELECT cl.id,
    cl.customer_id,
    cl.type,
    cl.page_id,
    cl.has_phone,
    cl.post_id,
    cl.added_user_id,
    cl.added_user_name,
    cl.name,
    cl.platform,
    cl.inserted_at,
    cl.customer_name,
    cl.phone,
    (cl.inserted_at + '07:00:00'::interval) AS insert_at_7_utc,
    cl.source,
    lo.conversation_id,
    lo.order_id,
    lo.order_number,
    lo.total_price,
    lo.real_created_at,
    lo.row_num,
    lt.tag_label,
    ta._tag_label,
    lt.tag_page_id,
    lt.tag_inserted_at,
    (lt.tag_inserted_at + '07:00:00'::interval) AS tag_inserted_at_plus7
   FROM (((conversation_rate.leads cl
     LEFT JOIN lead_orders lo ON (((cl.id)::text = (lo.conversation_id)::text)))
     LEFT JOIN lead_tags lt ON (((cl.id)::text = (lt.conversation_id)::text)))
     LEFT JOIN tag_aggregation ta ON (((cl.id)::text = (ta.conversation_id)::text)))
  WITH NO DATA;


--
-- Name: user_department_view; Type: MATERIALIZED VIEW; Schema: dashboard_reporting; Owner: -
--

CREATE MATERIALIZED VIEW dashboard_reporting.user_department_view AS
 WITH sale_elements_cte AS (
         SELECT bd.name_value,
            split_part((bd.name_value)::text, ' - '::text, 1) AS city,
            split_part((bd.name_value)::text, ' - '::text, 2) AS branch,
            split_part((bd.name_value)::text, ' - '::text, 3) AS "position",
            (((sale_elements.value -> 'sale'::text) -> 0) ->> 'id'::text) AS member_id
           FROM bizflycrm.departments bd,
            LATERAL jsonb_array_elements(bd.list_sale) sale_elements(value)
          WHERE ((bd.list_sale IS NOT NULL) AND ((bd.name_value)::text ~~ '%-%'::text) AND (split_part((bd.name_value)::text, ' - '::text, 3) ~~ '%Sale%'::text))
        )
 SELECT DISTINCT ON (bu.id) bu.id,
    bu.member_id,
    bu.name,
    bu.status,
    sec.name_value,
    sec.city,
    sec.branch,
    sec."position"
   FROM (bizflycrm.users bu
     LEFT JOIN sale_elements_cte sec ON (((bu.id)::text = sec.member_id)))
  ORDER BY bu.id
  WITH NO DATA;


--
-- Name: order_dim; Type: MATERIALIZED VIEW; Schema: dashboard_reporting; Owner: -
--

CREATE MATERIALIZED VIEW dashboard_reporting.order_dim AS
 SELECT ho.id,
    ((haravan.get_real_created_at(ho.id) AT TIME ZONE 'UTC'::text) AT TIME ZONE 'Asia/Ho_Chi_Minh'::text) AS real_created_at_7_utc,
    ((ho.created_at AT TIME ZONE 'UTC'::text) AT TIME ZONE 'Asia/Ho_Chi_Minh'::text) AS hrv_created_at,
    ho.order_number,
    ho.billing_address_country,
    ho.billing_address_province,
    ho.billing_address_district,
    ho.billing_address_ward,
    ho.cancel_reason,
    ((ho.cancelled_at AT TIME ZONE 'UTC'::text) AT TIME ZONE 'Asia/Ho_Chi_Minh'::text) AS hrv_cancelled_at,
    ho.customer_id AS hrv_customer_id,
    ho.customer_birthday,
    EXTRACT(year FROM age(((ho.customer_birthday)::date)::timestamp with time zone)) AS customer_age,
    ho.customer_email AS hrv_customer_email,
    ho.customer_phone AS hrv_customer_phone,
    concat(ho.customer_last_name, ' ', ho.customer_first_name) AS hrv_customer_name,
    ho.financial_status,
    ho.fulfillment_status,
    ho.tags,
    ho.gateway,
    ho.landing_site,
    ho.source,
    ho.shipping_address_country,
    ho.shipping_address_province,
    ho.shipping_address_district,
    ho.shipping_address_ward,
    ho.shipping_address_name,
    ho.subtotal_price,
    ho.total_price,
    ho.total_discounts,
    ho.total_line_items_price,
    ho.total_tax,
    ho.closed_status,
    ho.cancelled_status,
    ho.confirmed_status,
    ho.assigned_location_id,
    ho.assigned_location_name,
    ho.user_id AS hrv_user_id,
    ho.location_id,
    ho.location_name,
    ho.confirm_user AS hrv_confirm_user,
    bo.id AS crm_order_id,
    bo._allocation_value,
    bo.allocated,
    bo.da_thanh_toan,
    ((bo.delivered_date AT TIME ZONE 'UTC'::text) AT TIME ZONE 'Asia/Ho_Chi_Minh'::text) AS delivered_date,
    bo.order_left_amount,
    bo.order_paid_amount,
    bo.order_pretax,
    bo.paid_amount_percentage,
    bo.thoi_gian_giao_hang,
    bo.order_type_label,
    bo.order_type_value,
    bo.delivery_location_value,
    bo.consult_date,
    ((bo.consult_date AT TIME ZONE 'UTC'::text) AT TIME ZONE 'Asia/Ho_Chi_Minh'::text) AS consult_date_7_utc,
    bo.purpose_label,
    bo.product_category_label,
    bo.customer_id AS crm_customer_id,
    bo.customer_type_value AS order_customer_type,
    bo.main_sale_id,
    bo.main_sale_name,
    bc.ma_khach_hang,
    bc.customer_rank_label,
    bc.customer_type_label,
    bc.first_channel_label,
    bc.sale_id AS customer_care_employee_id,
    bc.customer_care_employee_name,
    bc.phone_value AS customer_phone,
    bc.customer_journey,
    bc.app_first_login_date,
    dru.status AS main_sale_status,
    dru.city AS main_sale_city,
    dru.branch AS main_sale_branch,
    dru."position" AS main_sale_position
   FROM (((haravan.orders ho
     LEFT JOIN bizflycrm.orders bo ON ((((ho.id)::character varying)::text = (bo.haravan_id)::text)))
     LEFT JOIN bizflycrm.customers bc ON (((bo.customer_id)::text = (bc.id)::text)))
     LEFT JOIN dashboard_reporting.user_department_view dru ON (((bo.main_sale_id)::text = (dru.id)::text)))
  WITH NO DATA;


--
-- Name: order_lead_dim; Type: MATERIALIZED VIEW; Schema: conversation_rate; Owner: -
--

CREATE MATERIALIZED VIEW conversation_rate.order_lead_dim AS
 SELECT dro.id,
    dro.real_created_at_7_utc,
    dro.hrv_created_at,
    dro.order_number,
    dro.billing_address_country,
    dro.billing_address_province,
    dro.billing_address_district,
    dro.billing_address_ward,
    dro.cancel_reason,
    dro.hrv_cancelled_at,
    dro.hrv_customer_id,
    dro.customer_birthday,
    dro.customer_age,
    dro.hrv_customer_email,
    dro.hrv_customer_phone,
    dro.hrv_customer_name,
    dro.financial_status,
    dro.fulfillment_status,
    dro.tags,
    dro.gateway,
    dro.landing_site,
    dro.source,
    dro.shipping_address_country,
    dro.shipping_address_province,
    dro.shipping_address_district,
    dro.shipping_address_ward,
    dro.shipping_address_name,
    dro.subtotal_price,
    dro.total_price,
    dro.total_discounts,
    dro.total_line_items_price,
    dro.total_tax,
    dro.closed_status,
    dro.cancelled_status,
    dro.confirmed_status,
    dro.assigned_location_id,
    dro.assigned_location_name,
    dro.hrv_user_id,
    dro.location_id,
    dro.location_name,
    dro.hrv_confirm_user,
    dro.crm_order_id,
    dro._allocation_value,
    dro.allocated,
    dro.da_thanh_toan,
    dro.delivered_date,
    dro.order_left_amount,
    dro.order_paid_amount,
    dro.order_pretax,
    dro.paid_amount_percentage,
    dro.thoi_gian_giao_hang,
    dro.order_type_label,
    dro.order_type_value,
    dro.delivery_location_value,
    dro.consult_date,
    dro.consult_date_7_utc,
    dro.purpose_label,
    dro.product_category_label,
    dro.crm_customer_id,
    dro.order_customer_type,
    dro.main_sale_id,
    dro.main_sale_name,
    dro.ma_khach_hang,
    dro.customer_rank_label,
    dro.customer_type_label,
    dro.first_channel_label,
    dro.customer_care_employee_id,
    dro.customer_care_employee_name,
    dro.customer_phone,
    dro.customer_journey,
    dro.app_first_login_date,
    dro.main_sale_status,
    dro.main_sale_city,
    dro.main_sale_branch,
    dro.main_sale_position,
    crol.order_id,
    crol.insert_at_7_utc
   FROM (dashboard_reporting.order_dim dro
     LEFT JOIN ( SELECT DISTINCT tag_order_leads.order_id,
            tag_order_leads.order_number,
            tag_order_leads.insert_at_7_utc
           FROM conversation_rate.tag_order_leads) crol ON ((dro.id = crol.order_id)))
  WITH NO DATA;


--
-- Name: order_leads; Type: MATERIALIZED VIEW; Schema: conversation_rate; Owner: -
--

CREATE MATERIALIZED VIEW conversation_rate.order_leads AS
 SELECT cl.id,
    cl.customer_id,
    cl.type,
    cl.page_id,
    cl.has_phone,
    cl.post_id,
    cl.added_user_id,
    cl.added_user_name,
    cl.name,
    cl.platform,
    cl.inserted_at,
    cl.customer_name,
    cl.phone,
    (cl.inserted_at + '07:00:00'::interval) AS insert_at_7_utc,
    cl.source,
    clo.conversation_id,
    clo.order_id,
    clo.order_number,
    clo.total_price,
    clo.real_created_at,
    clo.row_num,
    crt.tag_label,
    crt.tag_page_id
   FROM ((conversation_rate.leads cl
     LEFT JOIN conversation_rate.lead_orders clo ON (((cl.id)::text = (clo.conversation_id)::text)))
     LEFT JOIN conversation_rate.tags crt ON ((((cl.id)::text = (crt.conversation_id)::text) AND ((crt.tag_label)::text = ANY ((ARRAY['KH Spam'::character varying, 'KH Cho QR Zalo'::character varying])::text[])))))
  WITH NO DATA;


--
-- Name: lead_budgets; Type: TABLE; Schema: erpnext; Owner: -
--

CREATE TABLE erpnext.lead_budgets (
    uuid uuid NOT NULL,
    name character varying(255) NOT NULL,
    owner character varying(255),
    creation timestamp(6) without time zone,
    modified timestamp(6) without time zone,
    budget_label character varying(255),
    budget_from numeric(18,6),
    budget_to numeric(18,6),
    database_created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    database_updated_at timestamp(6) without time zone
);


--
-- Name: lead_demands; Type: TABLE; Schema: erpnext; Owner: -
--

CREATE TABLE erpnext.lead_demands (
    uuid uuid NOT NULL,
    name character varying(255) NOT NULL,
    owner character varying(255),
    creation timestamp(6) without time zone,
    modified timestamp(6) without time zone,
    demand_label character varying(255),
    database_created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    database_updated_at timestamp(6) without time zone
);


--
-- Name: leads; Type: TABLE; Schema: erpnext; Owner: -
--

CREATE TABLE erpnext.leads (
    uuid uuid NOT NULL,
    name character varying(255) NOT NULL,
    owner character varying(255),
    creation timestamp(6) without time zone,
    modified timestamp(6) without time zone,
    modified_by character varying(255),
    docstatus integer,
    idx integer,
    naming_series character varying(255),
    type character varying(255),
    salutation character varying(255),
    first_name character varying(255),
    middle_name character varying(255),
    territory character varying(255),
    lead_stage character varying(100),
    phone character varying(20),
    email_id character varying(255),
    job_title character varying(255),
    last_name character varying(255),
    gender character varying(10),
    qualified_lead_date timestamp(6) without time zone,
    first_reach_at timestamp(6) without time zone,
    lead_owner character varying(255),
    source character varying(255),
    status character varying(50),
    customer character varying(255),
    request_type character varying(100),
    lead_name character varying(255),
    lead_received_date timestamp(6) without time zone,
    lead_source_name character varying(255),
    lead_source_platform character varying(255),
    qualification_status character varying(255),
    qualified_by character varying(255),
    qualified_on timestamp(6) without time zone,
    purpose_lead character varying(255),
    expected_delivery_date date,
    budget_lead character varying(255),
    province character varying(255),
    region character varying(255),
    company_name character varying(255),
    no_of_employees character varying(20),
    annual_revenue numeric,
    industry character varying(255),
    market_segment character varying(255),
    fax character varying(255),
    tax_number character varying(255),
    ceo_name character varying(255),
    birth_date date,
    address text,
    personal_tax_id character varying(255),
    first_channel character varying(255),
    personal_id character varying(255),
    place_of_issuance character varying(255),
    date_of_issuance date,
    website character varying(255),
    bank_name character varying(255),
    bank_branch character varying(255),
    account_number character varying(255),
    bank_province character varying(255),
    bank_district character varying(255),
    bank_ward character varying(255),
    campaign_name character varying(255),
    company character varying(255),
    website_from_data character varying(255),
    language character varying(10),
    image text,
    title character varying(255),
    disabled integer,
    unsubscribed integer,
    blog_subscriber integer,
    mobile_no character varying(20),
    whatsapp_no character varying(20),
    phone_ext character varying(20),
    check_duplicate character varying(255),
    doctype character varying(50),
    notes jsonb,
    user_tags jsonb,
    preferred_product_type jsonb,
    database_created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP,
    database_updated_at timestamp(6) without time zone
);


--
-- Name: provinces; Type: TABLE; Schema: erpnext; Owner: -
--

CREATE TABLE erpnext.provinces (
    uuid uuid NOT NULL,
    name character varying(255) NOT NULL,
    owner character varying(255),
    creation timestamp(6) without time zone,
    modified timestamp(6) without time zone,
    province_name character varying(255),
    region character varying(255) NOT NULL,
    database_created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    database_updated_at timestamp(6) without time zone
);


--
-- Name: regions; Type: TABLE; Schema: erpnext; Owner: -
--

CREATE TABLE erpnext.regions (
    uuid uuid NOT NULL,
    name character varying(255) NOT NULL,
    owner character varying(255),
    creation timestamp(6) without time zone,
    modified timestamp(6) without time zone,
    region_name character varying(255) NOT NULL,
    database_created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    database_updated_at timestamp(6) without time zone
);


--
-- Name: crm_leads_view; Type: MATERIALIZED VIEW; Schema: crm_dashboard; Owner: -
--

CREATE MATERIALIZED VIEW crm_dashboard.crm_leads_view AS
 SELECT el.name,
    el.owner,
    (el.creation + '07:00:00'::interval) AS creation_gmt7,
    (el.modified + '07:00:00'::interval) AS modified_gmt7,
    el.title,
    el.lead_stage,
    el.phone,
    el.gender,
    (el.first_reach_at + '07:00:00'::interval) AS first_reach_at_gmt7,
    ((el.first_reach_at + '07:00:00'::interval))::date AS first_reach_at_date,
    el.lead_owner,
    el.status,
    el.customer,
    (el.lead_received_date + '07:00:00'::interval) AS lead_received_date_gmt7,
    el.lead_source_name,
    el.lead_source_platform,
    el.qualification_status,
    el.qualified_by,
    (el.qualified_on + '07:00:00'::interval) AS qualified_on_gmt7,
    ((el.qualified_on + '07:00:00'::interval))::date AS qualified_on_date,
    eld.demand_label,
    el.expected_delivery_date,
    elb.budget_label,
    ep.province_name,
    er.region_name,
    el.company_name,
    el.birth_date,
    el.address,
    el.image
   FROM ((((erpnext.leads el
     LEFT JOIN erpnext.lead_demands eld ON (((el.purpose_lead)::text = (eld.name)::text)))
     LEFT JOIN erpnext.lead_budgets elb ON (((el.budget_lead)::text = (elb.name)::text)))
     LEFT JOIN erpnext.provinces ep ON (((el.province)::text = (ep.name)::text)))
     LEFT JOIN erpnext.regions er ON (((el.region)::text = (er.name)::text)))
  WITH NO DATA;


--
-- Name: kpis_view; Type: MATERIALIZED VIEW; Schema: dashboard_reporting; Owner: -
--

CREATE MATERIALIZED VIEW dashboard_reporting.kpis_view AS
 SELECT bk.id,
    bk.status,
    ((bk.start_time AT TIME ZONE 'UTC'::text) AT TIME ZONE 'Asia/Ho_Chi_Minh'::text) AS start_time_7_utc,
    ((bk.end_time AT TIME ZONE 'UTC'::text) AT TIME ZONE 'Asia/Ho_Chi_Minh'::text) AS end_time_7_utc,
    to_char(bk.end_time, 'MM-YYYY'::text) AS end_month_year,
    (((sale_elements.value -> 'sale'::text) -> 0) ->> 'id'::text) AS member_id,
    COALESCE((sale_elements.value -> 'norm_value_sub_doanh_thu'::text), (sale_elements.value -> 'norm_value_sub_doanh_so'::text), (sale_elements.value -> 'norm_value_sub_doanh_thu_theo_phan_bo'::text)) AS target_value
   FROM bizflycrm.kpis bk,
    LATERAL jsonb_array_elements(bk.sale_data_item) sale_elements(value)
  WHERE (bk.sale_data_item <> 'null'::jsonb)
  WITH NO DATA;


--
-- Name: daily_sales_kpi_dim; Type: MATERIALIZED VIEW; Schema: dashboard_reporting; Owner: -
--

CREATE MATERIALIZED VIEW dashboard_reporting.daily_sales_kpi_dim AS
 WITH date_range AS (
         SELECT kpis_view.id,
            kpis_view.status,
            kpis_view.start_time_7_utc,
            kpis_view.end_time_7_utc,
            kpis_view.member_id,
            kpis_view.target_value,
            kpis_view.end_month_year,
            generate_series(kpis_view.start_time_7_utc, kpis_view.end_time_7_utc, '1 day'::interval) AS date
           FROM dashboard_reporting.kpis_view
        )
 SELECT dr.id,
    dr.status,
    dr.date AS created_at,
    dr.member_id,
    dr.end_month_year,
    bu.name,
    bu.city,
    bu.branch,
    bu."position",
        CASE
            WHEN (dr.date = dr.end_time_7_utc) THEN ((dr.target_value)::double precision - (((dr.target_value)::double precision / ((EXTRACT(day FROM (dr.end_time_7_utc - dr.start_time_7_utc)) + (1)::numeric))::double precision) * (EXTRACT(day FROM (dr.end_time_7_utc - dr.start_time_7_utc)))::double precision))
            ELSE ((dr.target_value)::double precision / ((EXTRACT(day FROM (dr.end_time_7_utc - dr.start_time_7_utc)) + (1)::numeric))::double precision)
        END AS daily_kpi
   FROM (date_range dr
     LEFT JOIN dashboard_reporting.user_department_view bu ON ((dr.member_id = (bu.id)::text)))
  WITH NO DATA;


--
-- Name: line_items; Type: TABLE; Schema: haravan; Owner: -
--

CREATE TABLE haravan.line_items (
    uuid character varying(36) NOT NULL,
    id integer,
    order_id integer,
    fulfillable_quantity integer,
    fulfillment_service character varying,
    fulfillment_status character varying,
    grams double precision,
    price numeric(36,8),
    price_original numeric(36,8),
    price_promotion numeric(36,8),
    product_id bigint,
    quantity integer,
    requires_shipping boolean,
    sku character varying,
    title character varying,
    variant_id bigint,
    variant_title character varying,
    vendor character varying,
    type character varying,
    name character varying,
    gift_card boolean,
    taxable boolean,
    tax_lines jsonb,
    product_exists boolean,
    barcode character varying,
    properties jsonb,
    total_discount numeric(36,8),
    applied_discounts jsonb,
    image jsonb,
    not_allow_promotion boolean,
    ma_cost_amount double precision,
    database_created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    database_updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: designs; Type: TABLE; Schema: workplace; Owner: -
--

CREATE TABLE workplace.designs (
    id integer NOT NULL,
    code text,
    erp_code text,
    backup_code text,
    design_type text,
    gender text,
    design_year text DEFAULT '2025'::text,
    design_seq bigint,
    usage_status text,
    link_4view text,
    folder_summary text,
    link_3d text,
    link_render text,
    link_retouch text,
    ring_band_type text,
    ring_band_style text,
    ring_head_style text,
    jewelry_rd_style text,
    shape_of_main_stone text,
    product_line text,
    social_post boolean DEFAULT false,
    website boolean DEFAULT false,
    "RENDER" boolean,
    "RETOUCH" boolean DEFAULT false,
    gold_weight numeric,
    main_stone text,
    stone_quantity text,
    stone_weight text,
    diamond_holder text,
    source text,
    variant_number bigint DEFAULT 1,
    collections_id integer,
    image_4view text,
    image_render text,
    image_retouch text,
    created_by character varying,
    updated_by character varying,
    database_created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    database_updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    collection_name text,
    auto_create_folder boolean,
    design_code text,
    ecom_showed boolean DEFAULT false,
    tag text,
    stock_locations text,
    wedding_ring_id integer,
    reference_code text,
    design_status text DEFAULT 'active'::text,
    erp_code_duplicated boolean DEFAULT false,
    max_seq integer,
    last_synced_render text,
    last_synced_4view text DEFAULT ''::text,
    pick_up date,
    created_date date
);


--
-- Name: diamonds; Type: TABLE; Schema: workplace; Owner: -
--

CREATE TABLE workplace.diamonds (
    id integer NOT NULL,
    barcode text,
    report_lab text,
    report_no bigint,
    price numeric,
    cogs numeric,
    product_group text,
    shape text,
    cut text,
    color text,
    clarity text,
    fluorescence text,
    edge_size_1 real,
    edge_size_2 real,
    carat numeric,
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    created_by character varying,
    updated_by character varying,
    database_updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    database_created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    auto_create_haravan_product boolean DEFAULT false,
    product_id bigint,
    variant_id bigint,
    promotions text DEFAULT 'CT nền giảm KCV 8%'::text,
    link_haravan text,
    note text,
    vendor text,
    published_scope text DEFAULT 'global'::text,
    qty_onhand real,
    qty_available real,
    qty_commited real,
    qty_incoming real,
    printing_batch text,
    g1_collection_id integer
);


--
-- Name: products; Type: TABLE; Schema: workplace; Owner: -
--

CREATE TABLE workplace.products (
    id integer NOT NULL,
    haravan_product_id bigint,
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    created_by character varying,
    updated_by character varying,
    nc_order numeric,
    vendor text DEFAULT 'Jemmia'::text,
    haravan_product_type text,
    design_id bigint,
    published_scope text DEFAULT 'pos'::text,
    database_updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    database_created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    template_suffix text,
    handle text,
    auto_create_haravan boolean DEFAULT false,
    note text,
    web_url text,
    ecom_title text,
    g1_promotion text DEFAULT '16%'::text,
    published text,
    estimated_gold_weight numeric,
    has_360 boolean DEFAULT false,
    diamond_shape text,
    stone_min_width numeric,
    stone_max_width numeric,
    stone_min_length numeric,
    stone_max_length numeric,
    collections text,
    haravan_collections_id integer
);


--
-- Name: variants; Type: TABLE; Schema: workplace; Owner: -
--

CREATE TABLE workplace.variants (
    id integer NOT NULL,
    haravan_variant_id bigint,
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    created_by character varying,
    updated_by character varying,
    nc_order numeric,
    product_id bigint,
    barcode text,
    inventory_quantity bigint,
    old_inventory_quantity bigint,
    sku text,
    qty_available bigint,
    qty_onhand bigint,
    qty_commited bigint,
    qty_incoming bigint,
    category text DEFAULT 'Trang sức'::text,
    applique_material text,
    fineness text,
    material_color text,
    size_type text,
    ring_size numeric,
    database_updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    database_created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    haravan_product_id bigint,
    price numeric,
    auto_create_variant boolean DEFAULT false,
    note text,
    estimated_gold_weight real
);


--
-- Name: line_item_dim; Type: MATERIALIZED VIEW; Schema: dashboard_reporting; Owner: -
--

CREATE MATERIALIZED VIEW dashboard_reporting.line_item_dim AS
 WITH bizfly_ranked_items AS (
         SELECT bo.id,
            bo.haravan_id,
            bli.variant_id,
            bli.product_status_value,
            bo.database_created_at,
            row_number() OVER (PARTITION BY bo.id, bli.item_id ORDER BY bo.database_created_at DESC) AS rn
           FROM (bizflycrm.orders bo
             LEFT JOIN bizflycrm.line_items bli ON (((bo.id)::text = (bli.order_id)::text)))
        )
 SELECT hli.id AS line_item_id,
    hli.order_id,
    hli.fulfillment_service,
    hli.fulfillment_status AS line_item_fulfillment_status,
    hli.price,
    hli.price_original,
    hli.price_promotion,
    hli.quantity,
    hli.product_id,
    hli.sku,
    hli.title,
    hli.variant_id,
    hli.variant_title,
    hli.vendor,
    hli.type,
    hli.barcode,
    hli.total_discount,
    hri.product_status_value,
    wdi.report_lab,
    wdi.report_no,
    wdi.shape AS diamond_shape,
    wdi.cut AS diamond_cut,
    wdi.color AS diamond_color,
    wdi.clarity AS diamond_clarity,
    wdi.fluorescence AS diamond_fluorescence,
    wdi.edge_size_1 AS diamond_edge_size_1,
    wdi.edge_size_2 AS diamond_edge_size_2,
    wdi.carat AS diamond_carat,
    wv.category AS jewelrie_category,
    wv.applique_material AS jewelrie_applique_material,
    wv.fineness AS jewelrie_fineness,
    wv.material_color AS jewelrie_material_color,
    wv.size_type AS jewelrie_size_type,
    wv.ring_size AS jewelrie_ring_size,
    wd.design_code,
    wd.code,
    wd.erp_code,
    wd.ring_band_type,
    wd.ring_band_style,
    wd.ring_head_style,
    wd.jewelry_rd_style,
    COALESCE(( SELECT (jsonb_array_elements((wd.image_render)::jsonb) ->> 'url'::text)
         LIMIT 1), 'https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg'::text) AS design_image
   FROM (((((haravan.line_items hli
     LEFT JOIN bizfly_ranked_items hri ON ((((hri.haravan_id)::text = (hli.order_id)::text) AND ((hri.variant_id)::text = (hli.variant_id)::text))))
     LEFT JOIN workplace.diamonds wdi ON ((hli.variant_id = wdi.variant_id)))
     LEFT JOIN workplace.variants wv ON ((hli.variant_id = wv.haravan_variant_id)))
     LEFT JOIN workplace.products wp ON ((wv.product_id = wp.id)))
     LEFT JOIN workplace.designs wd ON ((wd.id = wp.design_id)))
  WHERE (hri.rn = 1)
  WITH NO DATA;


--
-- Name: order_allocation_fact; Type: MATERIALIZED VIEW; Schema: dashboard_reporting; Owner: -
--

CREATE MATERIALIZED VIEW dashboard_reporting.order_allocation_fact AS
 SELECT dr.id,
    dr.real_created_at_7_utc,
    dr.hrv_created_at,
    dr.order_number,
    dr.billing_address_country,
    dr.billing_address_province,
    dr.billing_address_district,
    dr.billing_address_ward,
    dr.cancel_reason,
    dr.hrv_cancelled_at,
    dr.hrv_customer_id,
    dr.customer_birthday,
    dr.customer_age,
    dr.hrv_customer_email,
    dr.hrv_customer_phone,
    dr.hrv_customer_name,
    dr.financial_status,
    dr.fulfillment_status,
    dr.tags,
    dr.gateway,
    dr.landing_site,
    dr.source,
    dr.shipping_address_country,
    dr.shipping_address_province,
    dr.shipping_address_district,
    dr.shipping_address_ward,
    dr.shipping_address_name,
    dr.subtotal_price,
    dr.total_price,
    dr.total_discounts,
    dr.total_line_items_price,
    dr.total_tax,
    dr.closed_status,
    dr.cancelled_status,
    dr.confirmed_status,
    dr.assigned_location_id,
    dr.assigned_location_name,
    dr.hrv_user_id,
    dr.location_id,
    dr.location_name,
    dr.hrv_confirm_user,
    dr.crm_order_id,
    dr._allocation_value,
    dr.allocated,
    dr.da_thanh_toan,
    dr.delivered_date,
    dr.order_left_amount,
    dr.order_paid_amount,
    dr.order_pretax,
    dr.paid_amount_percentage,
    dr.thoi_gian_giao_hang,
    dr.order_type_label,
    dr.order_type_value,
    dr.delivery_location_value,
    dr.consult_date,
    dr.consult_date_7_utc,
    dr.purpose_label,
    dr.product_category_label,
    dr.crm_customer_id,
    dr.order_customer_type,
    dr.main_sale_id,
    dr.main_sale_name,
    dr.ma_khach_hang,
    dr.customer_rank_label,
    dr.customer_type_label,
    dr.first_channel_label,
    dr.customer_care_employee_id,
    dr.customer_care_employee_name,
    dr.customer_phone,
    dr.customer_journey,
    dr.app_first_login_date,
    dr.main_sale_status,
    dr.main_sale_city,
    dr.main_sale_branch,
    dr.main_sale_position,
    ba.sale_id,
    ba.sale_name,
    ba.total_amount,
    ba.allocation_amount,
    ba.allocation_amount_percent,
    dru.city,
    dru.branch,
    dru."position",
    dru.status
   FROM ((dashboard_reporting.order_dim dr
     LEFT JOIN bizflycrm.allocations ba ON (((ba.order_id)::text = (dr.crm_order_id)::text)))
     LEFT JOIN dashboard_reporting.user_department_view dru ON (((ba.sale_id)::text = (dru.id)::text)))
  WITH NO DATA;


--
-- Name: order_line_item_fact; Type: MATERIALIZED VIEW; Schema: dashboard_reporting; Owner: -
--

CREATE MATERIALIZED VIEW dashboard_reporting.order_line_item_fact AS
 SELECT order_dim.id,
    order_dim.real_created_at_7_utc,
    order_dim.hrv_created_at,
    order_dim.order_number,
    order_dim.billing_address_country,
    order_dim.billing_address_province,
    order_dim.billing_address_district,
    order_dim.billing_address_ward,
    order_dim.cancel_reason,
    order_dim.hrv_cancelled_at,
    order_dim.hrv_customer_id,
    order_dim.customer_birthday,
    order_dim.customer_age,
    order_dim.hrv_customer_email,
    order_dim.hrv_customer_phone,
    order_dim.hrv_customer_name,
    order_dim.financial_status,
    order_dim.fulfillment_status,
    order_dim.tags,
    order_dim.gateway,
    order_dim.landing_site,
    order_dim.source,
    order_dim.shipping_address_country,
    order_dim.shipping_address_province,
    order_dim.shipping_address_district,
    order_dim.shipping_address_ward,
    order_dim.shipping_address_name,
    order_dim.subtotal_price,
    order_dim.total_price,
    order_dim.total_discounts,
    order_dim.total_line_items_price,
    order_dim.total_tax,
    order_dim.closed_status,
    order_dim.cancelled_status,
    order_dim.confirmed_status,
    order_dim.assigned_location_id,
    order_dim.assigned_location_name,
    order_dim.hrv_user_id,
    order_dim.location_id,
    order_dim.location_name,
    order_dim.hrv_confirm_user,
    order_dim.crm_order_id,
    order_dim._allocation_value,
    order_dim.allocated,
    order_dim.da_thanh_toan,
    order_dim.delivered_date,
    order_dim.order_left_amount,
    order_dim.order_paid_amount,
    order_dim.order_pretax,
    order_dim.paid_amount_percentage,
    order_dim.thoi_gian_giao_hang,
    order_dim.order_type_label,
    order_dim.order_type_value,
    order_dim.delivery_location_value,
    order_dim.consult_date,
    order_dim.consult_date_7_utc,
    order_dim.purpose_label,
    order_dim.product_category_label,
    order_dim.crm_customer_id,
    order_dim.order_customer_type,
    order_dim.main_sale_id,
    order_dim.main_sale_name,
    order_dim.ma_khach_hang,
    order_dim.customer_rank_label,
    order_dim.customer_type_label,
    order_dim.first_channel_label,
    order_dim.customer_care_employee_id,
    order_dim.customer_care_employee_name,
    order_dim.customer_phone,
    order_dim.customer_journey,
    order_dim.app_first_login_date,
    order_dim.main_sale_status,
    order_dim.main_sale_city,
    order_dim.main_sale_branch,
    order_dim.main_sale_position,
    line_item_dim.line_item_id,
    line_item_dim.order_id,
    line_item_dim.fulfillment_service,
    line_item_dim.line_item_fulfillment_status,
    line_item_dim.price,
    line_item_dim.price_original,
    line_item_dim.price_promotion,
    line_item_dim.quantity,
    line_item_dim.product_id,
    line_item_dim.sku,
    line_item_dim.title,
    line_item_dim.variant_id,
    line_item_dim.variant_title,
    line_item_dim.vendor,
    line_item_dim.type,
    line_item_dim.barcode,
    line_item_dim.total_discount,
    line_item_dim.product_status_value,
    line_item_dim.report_lab,
    line_item_dim.report_no,
    line_item_dim.diamond_shape,
    line_item_dim.diamond_cut,
    line_item_dim.diamond_color,
    line_item_dim.diamond_clarity,
    line_item_dim.diamond_fluorescence,
    line_item_dim.diamond_edge_size_1,
    line_item_dim.diamond_edge_size_2,
    line_item_dim.diamond_carat,
    line_item_dim.jewelrie_category,
    line_item_dim.jewelrie_applique_material,
    line_item_dim.jewelrie_fineness,
    line_item_dim.jewelrie_material_color,
    line_item_dim.jewelrie_size_type,
    line_item_dim.jewelrie_ring_size,
    line_item_dim.design_code,
    line_item_dim.code,
    line_item_dim.erp_code,
    line_item_dim.ring_band_type,
    line_item_dim.ring_band_style,
    line_item_dim.ring_head_style,
    line_item_dim.jewelry_rd_style,
    line_item_dim.design_image
   FROM (dashboard_reporting.order_dim
     LEFT JOIN dashboard_reporting.line_item_dim ON ((order_dim.id = line_item_dim.order_id)))
  WITH NO DATA;


--
-- Name: time_dim; Type: TABLE; Schema: dashboard_reporting; Owner: -
--

CREATE TABLE dashboard_reporting.time_dim (
    col integer NOT NULL,
    day timestamp without time zone
);


--
-- Name: time_dim_col_seq; Type: SEQUENCE; Schema: dashboard_reporting; Owner: -
--

CREATE SEQUENCE dashboard_reporting.time_dim_col_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: time_dim_col_seq; Type: SEQUENCE OWNED BY; Schema: dashboard_reporting; Owner: -
--

ALTER SEQUENCE dashboard_reporting.time_dim_col_seq OWNED BY dashboard_reporting.time_dim.col;


--
-- Name: hrv_inventory_locations; Type: TABLE; Schema: data_2024; Owner: -
--

CREATE TABLE data_2024.hrv_inventory_locations (
    id integer,
    loc_id integer,
    product_id integer,
    variant_id integer,
    qty_onhand integer,
    qty_commited integer,
    qty_incoming integer,
    qty_available integer,
    updated_at text
);


--
-- Name: mapping_first_channel; Type: TABLE; Schema: data_2024; Owner: -
--

CREATE TABLE data_2024.mapping_first_channel (
    a character varying(255),
    b character varying(255)
);


--
-- Name: jewelry_diamond_pairs; Type: TABLE; Schema: ecom; Owner: -
--

CREATE TABLE ecom.jewelry_diamond_pairs (
    id text DEFAULT (gen_random_uuid())::text NOT NULL,
    haravan_product_id integer NOT NULL,
    haravan_variant_id integer NOT NULL,
    haravan_diamond_product_id integer NOT NULL,
    haravan_diamond_variant_id integer NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: leads; Type: TABLE; Schema: ecom; Owner: -
--

CREATE TABLE ecom.leads (
    id integer NOT NULL,
    raw_data jsonb,
    database_created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    custom_uuid text DEFAULT (gen_random_uuid())::text
);


--
-- Name: leads_id_seq; Type: SEQUENCE; Schema: ecom; Owner: -
--

CREATE SEQUENCE ecom.leads_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: leads_id_seq; Type: SEQUENCE OWNED BY; Schema: ecom; Owner: -
--

ALTER SEQUENCE ecom.leads_id_seq OWNED BY ecom.leads.id;


--
-- Name: images; Type: TABLE; Schema: haravan; Owner: -
--

CREATE TABLE haravan.images (
    uuid character varying NOT NULL,
    id bigint NOT NULL,
    product_id integer NOT NULL,
    src character varying,
    "position" integer,
    filename character varying,
    variant_ids jsonb,
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    database_created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    database_updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: products; Type: TABLE; Schema: haravan; Owner: -
--

CREATE TABLE haravan.products (
    uuid character varying NOT NULL,
    id integer,
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    published_at timestamp without time zone,
    published_scope character varying,
    handle character varying,
    product_type character varying,
    images jsonb,
    tags character varying,
    template_suffix character varying,
    title character varying,
    variants jsonb,
    only_hide_from_list boolean,
    not_allow_promotion boolean,
    options jsonb,
    database_created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    database_updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: variants; Type: TABLE; Schema: haravan; Owner: -
--

CREATE TABLE haravan.variants (
    uuid character varying NOT NULL,
    id bigint,
    product_id bigint,
    published_scope character varying,
    handle character varying,
    product_type character varying,
    template_suffix character varying,
    product_title character varying,
    product_vendor character varying,
    barcode character varying,
    compare_at_price numeric(36,8),
    created_at timestamp without time zone,
    fulfillment_service character varying,
    grams integer,
    inventory_management character varying,
    inventory_policy character varying,
    inventory_quantity integer,
    "position" integer,
    price numeric(36,8),
    requires_shipping boolean,
    sku character varying,
    taxable boolean,
    title character varying,
    updated_at timestamp without time zone,
    image_id bigint,
    option1 character varying,
    option2 character varying,
    option3 character varying,
    qty_onhand integer,
    qty_commited integer,
    qty_available integer,
    qty_incoming integer,
    database_created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    database_updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: materialized_variants; Type: MATERIALIZED VIEW; Schema: ecom; Owner: -
--

CREATE MATERIALIZED VIEW ecom.materialized_variants AS
 WITH images AS (
         SELECT i.product_id,
            i.src,
                CASE
                    WHEN (split_part((i.filename)::text, '--'::text, 2) = 'vang-trang'::text) THEN 'Vàng Trắng'::text
                    WHEN (split_part((i.filename)::text, '--'::text, 2) = 'vang-hong'::text) THEN 'Vàng Hồng'::text
                    WHEN (split_part((i.filename)::text, '--'::text, 2) = 'vang-vang'::text) THEN 'Vàng Vàng'::text
                    WHEN (split_part((i.filename)::text, '--'::text, 2) = 'vang-trang-vang-hong'::text) THEN 'Vàng Trắng - Vàng Hồng'::text
                    WHEN (split_part((i.filename)::text, '--'::text, 2) = 'vang-trang-vang-vang'::text) THEN 'Vàng Trắng - Vàng Vàng'::text
                    WHEN (split_part((i.filename)::text, '--'::text, 2) = 'vang-hong-vang-vang'::text) THEN 'Vàng Hồng - Vàng Vàng'::text
                    WHEN (split_part((i.filename)::text, '--'::text, 2) = 'bac'::text) THEN 'Bạc'::text
                    ELSE ''::text
                END AS color
           FROM haravan.images i
          WHERE (split_part((i.filename)::text, '--'::text, 2) <> ''::text)
        ), variants AS (
         SELECT DISTINCT v_1.haravan_variant_id
           FROM ((workplace.variants v_1
             JOIN workplace.products p_1 ON ((v_1.product_id = p_1.id)))
             JOIN images ON (((v_1.material_color = images.color) AND (p_1.haravan_product_id = images.product_id))))
          WHERE (v_1.haravan_variant_id IS NOT NULL)
        ), products AS (
         SELECT DISTINCT ON (p_1.id) p_1.id AS product_id,
            d_1.design_type,
            v_1.applique_material,
            d_1.gender,
                CASE
                    WHEN (d_1.diamond_holder = 'Có ổ chủ'::text) THEN 'Vỏ'::text
                    ELSE ''::text
                END AS cover
           FROM ((workplace.products p_1
             JOIN workplace.designs d_1 ON ((p_1.design_id = d_1.id)))
             JOIN workplace.variants v_1 ON ((p_1.id = v_1.product_id)))
          WHERE (v_1.applique_material = ANY (ARRAY['Kim Cương Tự Nhiên'::text, 'Không Đính Đá'::text]))
          ORDER BY p_1.id, v_1.id
        )
 SELECT vv.product_id AS haravan_product_id,
    vv.id AS haravan_variant_id,
    vv.sku,
        CASE
            WHEN (p.g1_promotion = '16%'::text) THEN (vv.price * 0.84)
            ELSE vv.price
        END AS price,
    vv.price AS price_compare_at,
    v.material_color,
    v.fineness,
    d.ring_band_style,
    d.ring_head_style,
    v.ring_size,
    v.applique_material,
    v.estimated_gold_weight,
    vv.qty_onhand,
    vv.qty_available
   FROM (((((workplace.products p
     JOIN haravan.products pp ON ((p.haravan_product_id = pp.id)))
     JOIN workplace.designs d ON ((p.design_id = d.id)))
     JOIN workplace.variants v ON (((p.id = v.product_id) AND (((v.applique_material = ANY (ARRAY['Kim Cương Tự Nhiên'::text, 'Không Đính Đá'::text])) AND (v.fineness = ANY (ARRAY['Vàng 18K'::text, 'Vàng 14K'::text]))) OR (v.haravan_variant_id = 1157905842)))))
     JOIN haravan.variants vv ON (((v.haravan_variant_id = vv.id) AND (vv.price > (0)::numeric))))
     JOIN products ON ((products.product_id = p.id)))
  WHERE ((p.haravan_product_id IS NOT NULL) AND ((pp.published_scope)::text = ANY (ARRAY[('global'::character varying)::text, ('web'::character varying)::text])) AND (v.haravan_variant_id IN ( SELECT variants.haravan_variant_id
           FROM variants)) AND ((pp.product_type)::text = ANY (ARRAY[('Bông Tai'::character varying)::text, ('Bông Tai Nguyên Chiếc'::character varying)::text, ('Dây Chuyền Liền Mặt'::character varying)::text, ('Lắc Tay'::character varying)::text, ('Mặt Dây Chuyền'::character varying)::text, ('Nhẫn Nam'::character varying)::text, ('Nhẫn Nữ'::character varying)::text, ('Nhẫn Nữ Nguyên Chiếc'::character varying)::text, ('Nhẫn Nam Nguyên Chiếc'::character varying)::text, ('Vòng Cổ'::character varying)::text, ('Vòng Tay'::character varying)::text, ('Nhẫn Cưới'::character varying)::text, ('Dây Chuyền Trơn'::character varying)::text, ('Huy Hiệu'::character varying)::text])))
  WITH NO DATA;


--
-- Name: products; Type: TABLE; Schema: ecom; Owner: -
--

CREATE TABLE ecom.products (
    haravan_product_id bigint,
    haravan_product_type text,
    design_id bigint,
    handle character varying,
    workplace_id integer,
    category text,
    title text,
    min_price numeric,
    max_price numeric,
    qty_onhand bigint,
    image_updated_at timestamp without time zone,
    wedding_ring_id integer,
    primary_collection text,
    primary_collection_handle text,
    pages text,
    max_price_18 integer,
    max_price_14 integer
);


--
-- Name: qr_generator; Type: TABLE; Schema: ecom; Owner: -
--

CREATE TABLE ecom.qr_generator (
    id character varying NOT NULL,
    bank_code character varying,
    bank_account_number character varying,
    customer_name character varying,
    customer_phone_number character varying,
    transfer_amount bigint,
    transfer_note character varying,
    transfer_status character varying,
    haravan_order_number character varying,
    haravan_order_status character varying,
    haravan_order_id integer,
    haravan_order_total_price bigint,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    deleted_at timestamp without time zone,
    is_deleted boolean,
    qr_url text,
    lark_record_id character varying(255),
    all_lark_record_id character varying(255),
    misa_synced boolean DEFAULT false NOT NULL,
    misa_synced_at timestamp(6) without time zone,
    misa_sync_guid character varying(255),
    misa_sync_error_msg text
);


--
-- Name: variants; Type: TABLE; Schema: ecom; Owner: -
--

CREATE TABLE ecom.variants (
    hararvan_product_id bigint,
    haravan_variant_id bigint,
    sku character varying,
    price numeric,
    price_compare_at numeric(36,8),
    material_color text,
    fineness text,
    ring_size numeric,
    haravan_product_id integer
);


--
-- Name: wedding_rings; Type: TABLE; Schema: ecom; Owner: -
--

CREATE TABLE ecom.wedding_rings (
    id integer,
    title text,
    max_price numeric,
    min_price numeric,
    image_updated_at timestamp without time zone
);


--
-- Name: order_tracking; Type: TABLE; Schema: ecommerce; Owner: -
--

CREATE TABLE ecommerce.order_tracking (
    uuid uuid NOT NULL,
    haravan_order_id text NOT NULL,
    haravan_order_status text NOT NULL
);


--
-- Name: addresses; Type: TABLE; Schema: erpnext; Owner: -
--

CREATE TABLE erpnext.addresses (
    uuid uuid NOT NULL,
    name character varying(255) NOT NULL,
    owner character varying(255),
    creation timestamp(6) without time zone,
    modified timestamp(6) without time zone,
    modified_by character varying(255),
    docstatus integer,
    idx integer,
    address_type character varying(255),
    address_name character varying(255),
    phone character varying(255),
    email_id character varying(255),
    address_line2 text,
    address_title character varying(255),
    city character varying(255),
    county character varying(255),
    state character varying(255),
    pincode character varying(255),
    country character varying(255),
    province character varying(255),
    district character varying(255),
    ward character varying(255),
    address_line1 text,
    fax character varying(255),
    tax_category character varying(255),
    is_primary_address integer,
    is_shipping_address integer,
    disabled integer,
    haravan_id character varying(255),
    is_your_company_address integer,
    links jsonb,
    database_created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP,
    database_updated_at timestamp(6) without time zone
);


--
-- Name: contacts; Type: TABLE; Schema: erpnext; Owner: -
--

CREATE TABLE erpnext.contacts (
    uuid uuid NOT NULL,
    name character varying(255) NOT NULL,
    owner character varying(255),
    creation timestamp(6) without time zone,
    modified timestamp(6) without time zone,
    modified_by character varying(255),
    docstatus integer,
    idx integer,
    salutation character varying(50),
    first_name character varying(255),
    address character varying(255),
    gender character varying(20),
    sync_with_google_contacts integer,
    middle_name character varying(255),
    full_name character varying(255),
    last_name character varying(255),
    "user" character varying(255),
    inserted_at timestamp(6) without time zone,
    updated_at timestamp(6) without time zone,
    haravan_customer_id character varying(255),
    lead_owner character varying(255),
    source_group character varying(255),
    source character varying(255),
    status character varying(50),
    designation character varying(255),
    phone character varying(20),
    email_id character varying(255),
    mobile_no character varying(20),
    company_name character varying(255),
    image character varying(255),
    source_name character varying(255),
    type character varying(50),
    first_message_time timestamp(6) without time zone,
    last_message_time timestamp(6) without time zone,
    phone_number_provided_time timestamp(6) without time zone,
    department character varying(255),
    unsubscribed integer,
    last_outgoing_call_time timestamp(6) without time zone,
    last_incoming_call_time timestamp(6) without time zone,
    last_summarize_time timestamp(6) without time zone,
    is_replied integer,
    pancake_conversation_id character varying(255),
    pancake_inserted_at timestamp(6) without time zone,
    pancake_updated_at timestamp(6) without time zone,
    pancake_customer_id character varying(255),
    thread_id character varying(255),
    psid character varying(255),
    can_inbox integer,
    pancake_page_id character varying(255),
    custom_uuid character varying(255),
    page_url character varying(255),
    user_agent character varying(255),
    remote_ip character varying(255),
    form_id character varying(255),
    form_name character varying(255),
    form_inserted_at timestamp(6) without time zone,
    form_updated_at timestamp(6) without time zone,
    stringee_id character varying(255),
    stringee_to_number character varying(50),
    stringee_from_number character varying(50),
    stringee_start_time timestamp(6) without time zone,
    stringee_end_time timestamp(6) without time zone,
    stringee_from_internal integer,
    stringee_to_internal integer,
    stringee_recorded integer,
    video_call integer,
    google_contacts character varying(255),
    google_contacts_id character varying(255),
    pulled_from_google_contacts integer,
    is_primary_contact integer,
    is_billing_contact integer,
    links jsonb,
    phone_numbers jsonb,
    phone_nos jsonb,
    emails jsonb,
    database_created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP,
    database_updated_at timestamp(6) without time zone
);


--
-- Name: customers; Type: TABLE; Schema: erpnext; Owner: -
--

CREATE TABLE erpnext.customers (
    uuid uuid NOT NULL,
    name character varying(255) NOT NULL,
    owner character varying(255),
    creation timestamp(6) without time zone,
    modified timestamp(6) without time zone,
    modified_by character varying(255),
    docstatus integer,
    idx integer,
    naming_series character varying(255),
    salutation character varying(255),
    customer_name character varying(255),
    customer_group character varying(255),
    bizfly_customer_number character varying(255),
    is_internal_customer integer,
    customer_type character varying(255),
    customer_rank character varying(255),
    account_manager character varying(255),
    lead_name character varying(255),
    opportunity_name character varying(255),
    territory character varying(255),
    prospect_name character varying(255),
    company_name character varying(255),
    no_of_employees integer,
    industry character varying(255),
    market_segment character varying(255),
    tax_number character varying(255),
    ceo_name character varying(255),
    personal_document_type character varying(255),
    birth_date timestamp(6) without time zone,
    gender character varying(255),
    personal_id character varying(255),
    place_of_issuance character varying(255),
    person_name character varying(255),
    date_of_issuance timestamp(6) without time zone,
    first_source character varying(255),
    customer_website character varying(255),
    customer_journey character varying(255),
    default_currency character varying(255),
    default_bank_account character varying(255),
    default_price_list character varying(255),
    represents_company integer,
    customer_pos_id character varying(255),
    website character varying(255),
    language character varying(255),
    customer_details character varying(255),
    customer_primary_address character varying(255),
    primary_address character varying(1024),
    image character varying(255),
    customer_primary_contact character varying(255),
    primary_contact character varying(255),
    mobile_no character varying(255),
    email_id character varying(255),
    phone character varying(255),
    invoice_type character varying(255),
    vat_email character varying(255),
    vat_name character varying(255),
    vat_address character varying(255),
    personal_tax_id character varying(255),
    bank_account character varying(255),
    payment_terms character varying(255),
    loyalty_program character varying(255),
    loyalty_program_tier character varying(255),
    rank character varying(255),
    purchase_amount_last_12_months numeric(18,6),
    rank_expired_date timestamp(6) without time zone,
    priority_login_date timestamp(6) without time zone,
    cumulative_revenue numeric(18,6),
    cashback numeric(18,6),
    true_cumulative_revenue numeric(18,6),
    withdraw_cashback numeric(18,6),
    referrals_revenue numeric(18,6),
    pending_cashback numeric(18,6),
    priority_bank_account character varying(255),
    default_sales_partner character varying(255),
    default_commission_rate numeric(18,6),
    so_required integer,
    dn_required integer,
    is_frozen integer,
    disabled smallint,
    haravan_id character varying(255),
    bizfly_id character varying(255),
    tax_id character varying(255),
    tax_category character varying(255),
    tax_withholding_category character varying(255),
    account jsonb,
    portal_users jsonb,
    companies jsonb,
    sales_team jsonb,
    coupon_table jsonb,
    credit_limits jsonb,
    database_created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP,
    database_updated_at timestamp(6) without time zone
);


--
-- Name: employees; Type: TABLE; Schema: erpnext; Owner: -
--

CREATE TABLE erpnext.employees (
    uuid uuid NOT NULL,
    name text,
    user_id text,
    creation timestamp(6) without time zone,
    department text,
    employee_name text,
    gender text,
    modified timestamp(6) without time zone,
    modified_by text,
    status text
);


--
-- Name: lead_sources; Type: TABLE; Schema: erpnext; Owner: -
--

CREATE TABLE erpnext.lead_sources (
    uuid uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    pancake_page_id character varying,
    pancake_platform character varying,
    source_name character varying
);


--
-- Name: product_categories; Type: TABLE; Schema: erpnext; Owner: -
--

CREATE TABLE erpnext.product_categories (
    uuid uuid NOT NULL,
    name character varying(255) NOT NULL,
    owner character varying(255),
    creation timestamp(6) without time zone,
    modified timestamp(6) without time zone,
    modified_by character varying(255),
    docstatus integer,
    idx integer,
    title character varying(255)
);


--
-- Name: purchase_purposes; Type: TABLE; Schema: erpnext; Owner: -
--

CREATE TABLE erpnext.purchase_purposes (
    uuid uuid NOT NULL,
    name character varying(255) NOT NULL,
    owner character varying(255),
    creation timestamp(6) without time zone,
    modified timestamp(6) without time zone,
    modified_by character varying(255),
    docstatus integer,
    idx integer,
    title character varying(255)
);


--
-- Name: sales_order_notification_tracking; Type: TABLE; Schema: erpnext; Owner: -
--

CREATE TABLE erpnext.sales_order_notification_tracking (
    uuid uuid NOT NULL,
    order_name text NOT NULL,
    haravan_order_id text NOT NULL,
    lark_message_id text NOT NULL,
    database_created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    database_updated_at timestamp(3) without time zone NOT NULL,
    order_data jsonb
);


--
-- Name: sales_persons; Type: TABLE; Schema: erpnext; Owner: -
--

CREATE TABLE erpnext.sales_persons (
    uuid uuid NOT NULL,
    name text,
    employee text,
    bizfly_id text,
    creation timestamp(6) without time zone,
    department text,
    enabled smallint,
    is_group smallint,
    modified timestamp(6) without time zone,
    modified_by text,
    old_parent text,
    parent_sales_person text,
    sales_person_name text,
    sales_region text,
    targets jsonb
);


--
-- Name: users; Type: TABLE; Schema: erpnext; Owner: -
--

CREATE TABLE erpnext.users (
    uuid uuid NOT NULL,
    name text,
    email text,
    birth_date timestamp(3) without time zone,
    creation timestamp(6) without time zone,
    enabled smallint,
    full_name text,
    gender text,
    language text,
    location text,
    modified timestamp(6) without time zone,
    modified_by text,
    pancake_id text,
    role_profile text,
    time_zone text,
    user_image text
);


--
-- Name: report_no_data; Type: TABLE; Schema: gia; Owner: -
--

CREATE TABLE gia.report_no_data (
    id bigint NOT NULL,
    report_no character varying(20) NOT NULL,
    report_type character varying(255),
    report_dt character varying(255),
    shape character varying(255),
    measurements character varying(255),
    weight character varying(255),
    color_grade character varying(255),
    clarity_grade character varying(255),
    cut_grade character varying(255),
    depth character varying(255),
    table_size character varying(255),
    crown_angle character varying(255),
    crown_height character varying(255),
    pavilion_angle character varying(255),
    pavilion_depth character varying(255),
    star_length character varying(255),
    lower_half character varying(255),
    girdle character varying(255),
    culet character varying(255),
    polish character varying(255),
    symmetry character varying(255),
    fluorescence character varying(255),
    clarity_characteristics character varying(255),
    inscription character varying(255),
    encrypted_report_no character varying(255),
    simple_encrypted_report_no character varying(255),
    is_pdf_available character varying(255),
    pdf_url character varying(255),
    propimg character varying(255),
    digital_card character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: report_no_data_id_seq; Type: SEQUENCE; Schema: gia; Owner: -
--

CREATE SEQUENCE gia.report_no_data_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: report_no_data_id_seq; Type: SEQUENCE OWNED BY; Schema: gia; Owner: -
--

ALTER SEQUENCE gia.report_no_data_id_seq OWNED BY gia.report_no_data.id;


--
-- Name: fulfillments; Type: TABLE; Schema: haravan; Owner: -
--

CREATE TABLE haravan.fulfillments (
    uuid character varying(36) NOT NULL,
    id bigint,
    order_id bigint,
    status character varying,
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    tracking_company character varying,
    tracking_company_code character varying,
    tracking_numbers jsonb,
    tracking_number character varying,
    tracking_url character varying,
    tracking_urls jsonb,
    database_created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    database_updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: accounting_sales_order_view; Type: MATERIALIZED VIEW; Schema: haravan; Owner: -
--

CREATE MATERIALIZED VIEW haravan.accounting_sales_order_view AS
 SELECT ho.id,
    ho.created_at,
    ho.updated_at,
    ho.name,
    ((haravan.get_real_created_at(ho.id) AT TIME ZONE 'UTC'::text) AT TIME ZONE 'Asia/Ho_Chi_Minh'::text) AS real_created_at,
    bo.customer_type_value AS customer_type,
    ho.fulfillment_status,
    ho.cancelled_status,
    ho.cancelled_at,
    ho.total_price,
    ho.assigned_location_name,
    bo.purpose_label,
    bo.delivery_location_value,
    ho.source,
    bo._total_data_item,
    bc.first_channel_label,
    bc.name_value,
    hf.status,
    hf.created_at AS fulfillment_created_at
   FROM (((haravan.orders ho
     LEFT JOIN bizflycrm.orders bo ON ((((ho.id)::character varying)::text = (bo.haravan_id)::text)))
     LEFT JOIN bizflycrm.customers bc ON (((bo.customer_id)::text = (bc.id)::text)))
     LEFT JOIN haravan.fulfillments hf ON ((ho.id = hf.order_id)))
  WHERE (EXTRACT(year FROM ((bo.created_at AT TIME ZONE 'UTC'::text) AT TIME ZONE 'Asia/Ho_Chi_Minh'::text)) = (2025)::numeric)
  WITH NO DATA;


--
-- Name: collection_product; Type: TABLE; Schema: haravan; Owner: -
--

CREATE TABLE haravan.collection_product (
    uuid character varying NOT NULL,
    id bigint,
    collection_id bigint,
    created_at timestamp without time zone,
    featured boolean,
    "position" integer,
    product_id bigint,
    sort_value character varying,
    updated_at timestamp without time zone,
    database_created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    database_updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: custom_collections; Type: TABLE; Schema: haravan; Owner: -
--

CREATE TABLE haravan.custom_collections (
    uuid character varying NOT NULL,
    id integer,
    body_html text,
    handle character varying,
    image jsonb,
    published boolean,
    published_at timestamp without time zone,
    published_scope character varying,
    sort_order character varying,
    template_suffix character varying,
    title character varying,
    updated_at timestamp without time zone,
    products_count integer,
    database_created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    database_updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: customers; Type: TABLE; Schema: haravan; Owner: -
--

CREATE TABLE haravan.customers (
    uuid character varying NOT NULL,
    id integer,
    accepts_marketing boolean,
    default_address jsonb,
    addresses jsonb,
    address_address1 character varying,
    address_address2 character varying,
    address_city character varying,
    address_company character varying,
    address_country character varying,
    address_country_code character varying,
    address_id bigint,
    address_first_name character varying,
    address_last_name character varying,
    address_phone character varying,
    address_province character varying,
    address_province_code character varying,
    address_zip character varying,
    address_name character varying,
    address_default boolean,
    address_district character varying,
    address_district_code character varying,
    address_ward character varying,
    address_ward_code character varying,
    email character varying,
    phone character varying,
    first_name character varying,
    last_name character varying,
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    multipass_identifier boolean,
    last_order_id bigint,
    last_order_name character varying,
    published boolean,
    note character varying,
    orders_count integer,
    state character varying,
    tags character varying,
    total_spent numeric(36,8),
    total_paid numeric(36,8),
    verified_email boolean,
    group_name character varying,
    birthday timestamp without time zone,
    gender integer,
    database_created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    database_updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: inventory_logs; Type: TABLE; Schema: haravan; Owner: -
--

CREATE TABLE haravan.inventory_logs (
    id bigint NOT NULL,
    storeid bigint,
    typeid bigint,
    locid bigint,
    refid bigint,
    reflineid bigint,
    refnumber character varying,
    productid bigint,
    variantid bigint,
    qty_onhand numeric,
    qty_commited numeric,
    qty_incoming numeric,
    last_qty_onhand numeric,
    last_qty_onhand_loc numeric,
    last_qty_onhand_lot numeric,
    last_qty_commited numeric,
    last_qty_commited_loc numeric,
    last_macostamount numeric,
    costamount numeric,
    trandate timestamp without time zone,
    createddate timestamp without time zone,
    createduser bigint,
    createdusername character varying,
    locationname character varying,
    trannumber character varying,
    lotno character varying,
    lotexpiredate timestamp without time zone,
    sku character varying,
    barcode character varying,
    producttypename character varying,
    productvendorname character varying,
    productname character varying,
    optionvalue character varying,
    reasonid bigint,
    varianttitle character varying,
    typename character varying
);


--
-- Name: orders_view; Type: MATERIALIZED VIEW; Schema: haravan; Owner: -
--

CREATE MATERIALIZED VIEW haravan.orders_view AS
 SELECT ho.id,
    ho.customer_id,
    bo.id AS bizfly_id,
    ho.name,
    bo.main_sale_id,
    bo.main_sale_name,
    ((haravan.get_real_created_at(ho.id) AT TIME ZONE 'UTC'::text) AT TIME ZONE 'Asia/Ho_Chi_Minh'::text) AS real_created_at,
    bo.customer_type_value AS customer_type,
    ho.customer_gender,
    ho.customer_birthday,
    ho.customer_default_address_province,
    ho.total_price,
    bo.purpose_label,
    ho.source,
    bo._total_data_item,
    bc.first_channel_label,
    bc.name_value,
    bc.id AS bizfly_customer_id
   FROM ((haravan.orders ho
     LEFT JOIN bizflycrm.orders bo ON ((((ho.id)::character varying)::text = (bo.haravan_id)::text)))
     LEFT JOIN bizflycrm.customers bc ON (((bo.customer_id)::text = (bc.id)::text)))
  WHERE (((ho.cancelled_status)::text = 'uncancelled'::text) AND (EXTRACT(year FROM ((haravan.get_real_created_at(ho.id) AT TIME ZONE 'UTC'::text) AT TIME ZONE 'Asia/Ho_Chi_Minh'::text)) = (2024)::numeric) AND (EXTRACT(month FROM ((haravan.get_real_created_at(ho.id) AT TIME ZONE 'UTC'::text) AT TIME ZONE 'Asia/Ho_Chi_Minh'::text)) <= (11)::numeric) AND ((ho.total_price > (120000)::numeric) OR ((ho.source)::text = 'app_android'::text)) AND ((ho.source)::text <> 'sendo'::text) AND ((ho.source)::text !~~ '%bhsc%'::text))
  WITH NO DATA;


--
-- Name: jewelries; Type: TABLE; Schema: workplace; Owner: -
--

CREATE TABLE workplace.jewelries (
    id integer NOT NULL,
    barcode text,
    category text DEFAULT 'Trang sức'::text,
    supplier_code text,
    gold_weight numeric,
    diamond_weight numeric,
    price numeric,
    cogs numeric,
    quantity smallint,
    order_code text,
    supplier text,
    note text,
    subcategory text,
    gender text,
    applique_material text,
    fineness text,
    material_color text,
    size_type text,
    ring_size numeric,
    storage_size_type text,
    storage_size_1 numeric,
    storage_size_2 numeric,
    design_id integer,
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    created_by character varying,
    updated_by character varying,
    database_updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    database_created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    product_group text,
    product_type text,
    type text,
    design_code text,
    "4view" text,
    link_3d text,
    link_4view text,
    supply_product_type text,
    stock bigint,
    printing_batch text,
    haravan_product_type text,
    vendor text,
    promotions text,
    auto_create_haravan_product boolean DEFAULT false,
    variant_id bigint,
    product_id bigint,
    link_haravan text,
    qty_onhand real,
    qty_commited real,
    qty_incoming real,
    qty_available real,
    published_scope text,
    ring_pair_id bigint,
    infomation text,
    code_in_title text,
    stored_sku text
);


--
-- Name: line_items_view; Type: MATERIALIZED VIEW; Schema: haravan; Owner: -
--

CREATE MATERIALIZED VIEW haravan.line_items_view AS
 SELECT ho.name,
    hl.id,
    hl.variant_id,
    hv.product_title,
    hl.price,
    hl.quantity,
    hv.barcode,
    hv.sku,
    hv.product_type,
    concat(wd.edge_size_1, 'x', wd.edge_size_2) AS diamond_size,
    hv.created_at,
    wd.edge_size_1,
    wd.edge_size_2,
    wd.carat,
    wj.design_code,
        CASE
            WHEN ((hv.title)::text ~~ '%[%'::text) THEN (product_info.extracted_text)::character varying
            ELSE hv.title
        END AS ma_san_pham
   FROM (((((haravan.line_items hl
     LEFT JOIN haravan.orders ho ON ((hl.order_id = ho.id)))
     LEFT JOIN haravan.variants hv ON ((hl.variant_id = hv.id)))
     LEFT JOIN workplace.diamonds wd ON (((hv.barcode)::text = wd.barcode)))
     LEFT JOIN workplace.jewelries wj ON ((wj.barcode = (hv.barcode)::text)))
     LEFT JOIN LATERAL ( SELECT (regexp_matches((hv.title)::text, '\[([^\]]+)\]'::text))[1] AS extracted_text) product_info ON (true))
  WHERE ((hl.order_id IN ( SELECT orders_view.id
           FROM haravan.orders_view)) AND ((hl.type)::text <> 'Quà Tặng'::text))
  WITH NO DATA;


--
-- Name: purchase_receives; Type: TABLE; Schema: haravan; Owner: -
--

CREATE TABLE haravan.purchase_receives (
    uuid character varying NOT NULL,
    id bigint,
    receive_number character varying,
    supplier jsonb,
    supplier_id bigint,
    supplier_name character varying,
    location jsonb,
    location_id bigint,
    location_name character varying,
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    received_at timestamp without time zone,
    notes text,
    status character varying,
    total numeric(36,8),
    total_cost numeric(36,8),
    tags character varying,
    ref_purchase_order_id character varying,
    ref_number character varying,
    line_items jsonb,
    database_created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    database_updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: purchase_receives_items; Type: TABLE; Schema: haravan; Owner: -
--

CREATE TABLE haravan.purchase_receives_items (
    uuid character varying NOT NULL,
    id bigint,
    purchase_receive_id bigint,
    purchase_receive_number character varying,
    product_id bigint,
    product_name character varying,
    product_variant_id bigint,
    variant_title character varying,
    sku character varying,
    barcode character varying,
    original_cost numeric(36,8),
    discount_amount numeric(36,8),
    cost numeric(36,8),
    product_quantity integer,
    total_cost numeric(36,8),
    variant_unit jsonb,
    lots jsonb,
    database_created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    database_updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: refunds; Type: TABLE; Schema: haravan; Owner: -
--

CREATE TABLE haravan.refunds (
    uuid character varying(36) NOT NULL,
    id bigint,
    order_id bigint,
    created_at timestamp without time zone,
    note character varying,
    refund_line_items jsonb,
    restock boolean,
    user_id bigint,
    location_id bigint,
    transactions jsonb,
    database_created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    database_updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: test_id_seq; Type: SEQUENCE; Schema: haravan; Owner: -
--

CREATE SEQUENCE haravan.test_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tests_id_seq; Type: SEQUENCE; Schema: haravan; Owner: -
--

CREATE SEQUENCE haravan.tests_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: transactions; Type: TABLE; Schema: haravan; Owner: -
--

CREATE TABLE haravan.transactions (
    uuid character varying(36) NOT NULL,
    id bigint,
    order_id bigint,
    amount numeric(36,8),
    "authorization" character varying(50),
    created_at timestamp without time zone,
    device_id bigint,
    gateway character varying(100),
    kind character varying(10),
    receipt character varying(255),
    status character varying(10),
    test boolean,
    user_id bigint,
    location_id bigint,
    currency character varying,
    is_cod_gateway boolean,
    database_created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    database_updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: users; Type: TABLE; Schema: haravan; Owner: -
--

CREATE TABLE haravan.users (
    uuid character varying NOT NULL,
    id bigint,
    email character varying,
    first_name character varying,
    last_name character varying,
    phone character varying,
    account_owner boolean,
    bio text,
    im text,
    receive_announcements integer,
    url text,
    user_type character varying,
    permissions jsonb,
    database_created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    database_updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: warehouse_inventories; Type: TABLE; Schema: haravan; Owner: -
--

CREATE TABLE haravan.warehouse_inventories (
    uuid character varying NOT NULL,
    id bigint,
    loc_id bigint,
    product_id bigint,
    variant_id bigint,
    qty_onhand bigint,
    qty_committed bigint,
    qty_available bigint,
    qty_incoming bigint,
    updated_at timestamp without time zone,
    database_created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    database_updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: warehouses; Type: TABLE; Schema: haravan; Owner: -
--

CREATE TABLE haravan.warehouses (
    id integer NOT NULL,
    name text
);


--
-- Name: inventory_check_sheets; Type: TABLE; Schema: inventory; Owner: -
--

CREATE TABLE inventory.inventory_check_sheets (
    id uuid NOT NULL,
    staff numeric,
    count_in_book numeric,
    count_for_real numeric,
    extra numeric,
    lines jsonb,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    warehouse character varying(255),
    warehouse_id numeric,
    code character varying(255)
);


--
-- Name: inventory_check_sheets_2024; Type: TABLE; Schema: inventory; Owner: -
--

CREATE TABLE inventory.inventory_check_sheets_2024 (
    id uuid,
    staff numeric,
    count_in_book numeric,
    count_for_real numeric,
    extra numeric,
    lines jsonb,
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    warehouse character varying(255),
    warehouse_id numeric,
    code character varying(255)
);


--
-- Name: rfid_tag_warehouse; Type: MATERIALIZED VIEW; Schema: inventory; Owner: -
--

CREATE MATERIALIZED VIEW inventory.rfid_tag_warehouse AS
 WITH ranked_rfid AS (
         SELECT rfid_data.id,
            rfid_data.rfid_tag,
            rfid_data.created_at,
            rfid_data.warehouse,
            rfid_data.warehouse_id,
            row_number() OVER (PARTITION BY rfid_data.rfid_tag ORDER BY rfid_data.created_at DESC) AS rnk
           FROM ( SELECT subquery.id,
                    jsonb_array_elements_text((subquery.rfid_tag_array)::jsonb) AS rfid_tag,
                    subquery.created_at,
                    subquery.warehouse,
                    subquery.warehouse_id
                   FROM ( SELECT inventory_check_sheets.id,
                            (jsonb_array_elements(inventory_check_sheets.lines) ->> 'rfid_tags'::text) AS rfid_tag_array,
                            inventory_check_sheets.created_at,
                            inventory_check_sheets.warehouse,
                            inventory_check_sheets.warehouse_id
                           FROM inventory.inventory_check_sheets) subquery) rfid_data
        )
 SELECT id,
    rfid_tag,
    created_at,
    warehouse,
    warehouse_id
   FROM ranked_rfid
  WHERE (rnk = 1)
  WITH NO DATA;


--
-- Name: rfid_tags_warehouse; Type: TABLE; Schema: inventory; Owner: -
--

CREATE TABLE inventory.rfid_tags_warehouse (
    id uuid NOT NULL,
    rfid_tag character varying,
    warehouse character varying,
    warehouse_id numeric,
    product_id numeric,
    varient_id numeric,
    count_in_book numeric,
    count_for_real numeric,
    count_extra_for_real numeric,
    varient_name character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: inventory_check_lines; Type: TABLE; Schema: inventory_cms; Owner: -
--

CREATE TABLE inventory_cms.inventory_check_lines (
    uuid uuid NOT NULL,
    id integer NOT NULL,
    status text,
    sort text,
    user_created text,
    date_created timestamp(3) without time zone,
    user_updated text,
    date_updated timestamp(3) without time zone,
    product_name text,
    product_id text,
    variant_id integer,
    count_in_book integer,
    count_for_real integer,
    checked_status text,
    sheet_id integer,
    variant_name text,
    product_image text,
    sku text,
    count_extra_for_real integer,
    barcode text,
    category text,
    count_in_ordered text,
    rfid_tags jsonb
);


--
-- Name: inventory_check_sheets; Type: TABLE; Schema: inventory_cms; Owner: -
--

CREATE TABLE inventory_cms.inventory_check_sheets (
    uuid uuid NOT NULL,
    id integer NOT NULL,
    status text,
    sort text,
    user_created text,
    date_created timestamp(3) without time zone,
    user_updated text,
    date_updated timestamp(3) without time zone,
    warehouse text,
    staff integer,
    result text,
    code text,
    warehouse_id text,
    count_in_book integer,
    count_for_real integer,
    extra integer,
    lines jsonb
);


--
-- Name: product_warehouse_stock_view; Type: MATERIALIZED VIEW; Schema: inventory_report; Owner: -
--

CREATE MATERIALIZED VIEW inventory_report.product_warehouse_stock_view AS
 SELECT hv.id AS variant_id,
    hv.product_id,
    hv.published_scope,
    hv.product_type AS haravan_product_type,
    hv.product_title,
    hv.barcode,
    hv.sku,
    hv.price,
    hv.title AS variant_title,
    hv.qty_onhand,
    hv.qty_commited,
    hv.qty_available,
    hv.qty_incoming,
    hv.created_at,
    hv.updated_at,
    wdi.report_lab,
    wdi.shape AS diamond_shape,
    wdi.cut AS diamond_cut,
    wdi.color AS diamond_color,
    wdi.clarity AS diamond_clarity,
    wdi.fluorescence AS diamond_fluorescence,
    wdi.edge_size_1 AS diamond_edge_size_1,
    wdi.edge_size_2 AS diamond_edge_size_2,
    wdi.carat AS diamond_carat,
    wv.category AS jewelrie_category,
    wv.applique_material AS jewelrie_applique_material,
    wv.fineness AS jewelrie_fineness,
    wv.material_color AS jewelrie_material_color,
    wv.size_type AS jewelrie_size_type,
    wv.ring_size AS jewelrie_ring_size,
    wv.id AS noco_variant_id,
    inventory.name AS location_name,
    inventory.qty_onhand AS stock_qty_onhand,
    inventory.qty_available AS stock_qty_available,
    inventory.qty_committed AS stock_qty_committed,
    inventory.qty_incoming AS stock_qty_incoming,
    wv.haravan_product_id,
    wd.design_code,
    wd.code,
    wd.erp_code,
    COALESCE(( SELECT (jsonb_array_elements((wd.image_render)::jsonb) ->> 'url'::text)
         LIMIT 1), 'https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg'::text) AS "coalesce"
   FROM (((((haravan.variants hv
     LEFT JOIN workplace.diamonds wdi ON ((hv.id = wdi.variant_id)))
     LEFT JOIN workplace.variants wv ON ((hv.id = wv.haravan_variant_id)))
     LEFT JOIN workplace.products wp ON ((wv.product_id = wp.id)))
     LEFT JOIN workplace.designs wd ON ((wd.id = wp.design_id)))
     JOIN ( SELECT hwi.uuid,
            hwi.id,
            hwi.loc_id,
            hwi.product_id,
            hwi.variant_id,
            hwi.qty_onhand,
            hwi.qty_committed,
            hwi.qty_available,
            hwi.qty_incoming,
            hwi.updated_at,
            hwi.database_created_at,
            hwi.database_updated_at,
            hw.id,
            hw.name
           FROM (haravan.warehouse_inventories hwi
             LEFT JOIN haravan.warehouses hw ON ((hwi.loc_id = hw.id)))
          WHERE ((hwi.qty_onhand <> 0) OR (hwi.qty_committed <> 0) OR (hwi.qty_incoming <> 0) OR (hwi.qty_available <> 0))) inventory(uuid, id, loc_id, product_id, variant_id, qty_onhand, qty_committed, qty_available, qty_incoming, updated_at, database_created_at, database_updated_at, id_1, name) ON ((hv.id = inventory.variant_id)))
  WHERE ((hv.qty_onhand <> 0) OR (hv.qty_commited <> 0) OR (hv.qty_incoming <> 0) OR (hv.qty_available <> 0))
  WITH NO DATA;


--
-- Name: metadata; Type: TABLE; Schema: jemmia; Owner: -
--

CREATE TABLE jemmia.metadata (
    product_id integer NOT NULL,
    variant_id integer,
    path_to_3dm text,
    collection_drive text
);


--
-- Name: buyback_exchange_approval_instances; Type: TABLE; Schema: larksuite; Owner: -
--

CREATE TABLE larksuite.buyback_exchange_approval_instances (
    id integer NOT NULL,
    instance_code character varying,
    serial_number character varying,
    instance_type character varying,
    order_code character varying,
    new_order_code character varying,
    status character varying,
    customer_name character varying,
    phone_number character varying,
    national_id character varying,
    products_info jsonb,
    reason character varying,
    refund_amount numeric,
    is_synced_to_crm boolean,
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    submitted_date timestamp without time zone
);


--
-- Name: buyback_exchange_approval_instances_id_seq; Type: SEQUENCE; Schema: larksuite; Owner: -
--

CREATE SEQUENCE larksuite.buyback_exchange_approval_instances_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: buyback_exchange_approval_instances_id_seq; Type: SEQUENCE OWNED BY; Schema: larksuite; Owner: -
--

ALTER SEQUENCE larksuite.buyback_exchange_approval_instances_id_seq OWNED BY larksuite.buyback_exchange_approval_instances.id;


--
-- Name: crm_lark_message; Type: TABLE; Schema: larksuite; Owner: -
--

CREATE TABLE larksuite.crm_lark_message (
    id uuid NOT NULL,
    parent_id uuid,
    crm_id character varying,
    database_created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    database_updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    lark_message_id character varying,
    order_data_item json,
    order_id bigint,
    order_name character varying
);


--
-- Name: cskh; Type: TABLE; Schema: larksuite; Owner: -
--

CREATE TABLE larksuite.cskh (
    instance_code text,
    instance_type text,
    order_code text,
    new_order_code text,
    status text,
    customer_name text,
    phone_number text,
    products_info text,
    reason text,
    refund_amount double precision,
    submitted_date timestamp without time zone
);


--
-- Name: customer_appointments; Type: TABLE; Schema: larksuite; Owner: -
--

CREATE TABLE larksuite.customer_appointments (
    uuid character varying NOT NULL,
    id character varying,
    lead_sale_name character varying,
    lead_sale_email character varying,
    suport_sale_name_list text,
    suport_sale_email_list text,
    store_name character varying,
    customer_name character varying,
    customer_phone character varying,
    customer_gender character varying,
    channel character varying,
    order_status character varying,
    expected_visit_date timestamp without time zone,
    expected_visit_time_utc_plus_7 timestamp without time zone,
    store_welcome_content text,
    exchange_policy text,
    note text,
    budget_range character varying,
    budget numeric(36,8),
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    database_created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    database_updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: departments; Type: TABLE; Schema: larksuite; Owner: -
--

CREATE TABLE larksuite.departments (
    department_id text NOT NULL,
    open_department_id text,
    name text,
    parent_department_id text
);


--
-- Name: groups; Type: TABLE; Schema: larksuite; Owner: -
--

CREATE TABLE larksuite.groups (
    group_id text NOT NULL,
    group_name text
);


--
-- Name: instances; Type: TABLE; Schema: larksuite; Owner: -
--

CREATE TABLE larksuite.instances (
    uuid text NOT NULL,
    serial_number text,
    instance_code text,
    approval_code text,
    approval_name text,
    status text,
    department_id text,
    start_time timestamp without time zone,
    end_time timestamp without time zone,
    user_id text,
    form jsonb,
    form_data jsonb
);


--
-- Name: lark_line_items_payment; Type: TABLE; Schema: larksuite; Owner: -
--

CREATE TABLE larksuite.lark_line_items_payment (
    lark_record_id character varying(255) NOT NULL,
    order_id character varying(50) NOT NULL,
    variant_id character varying NOT NULL
);


--
-- Name: lark_order_qr_generator; Type: TABLE; Schema: larksuite; Owner: -
--

CREATE TABLE larksuite.lark_order_qr_generator (
    haravan_order_id bigint NOT NULL,
    lark_record_id character varying(255) NOT NULL
);


--
-- Name: lark_variants; Type: TABLE; Schema: larksuite; Owner: -
--

CREATE TABLE larksuite.lark_variants (
    variant_id bigint NOT NULL,
    lark_record_id character varying(255)
);


--
-- Name: lark_variants_view; Type: MATERIALIZED VIEW; Schema: larksuite; Owner: -
--

CREATE MATERIALIZED VIEW larksuite.lark_variants_view AS
 SELECT hv.id AS variant_id,
    hv.product_id,
    hv.published_scope,
    hv.product_type AS haravan_product_type,
    hv.product_title,
    hv.barcode,
    hv.sku,
    hv.price,
    hv.title AS variant_title,
    hv.qty_onhand,
    hv.qty_commited,
    hv.qty_available,
    hv.qty_incoming,
    hv.created_at,
    hv.updated_at,
    wdi.report_lab,
    wdi.report_no,
    wdi.shape AS diamond_shape,
    wdi.cut AS diamond_cut,
    wdi.color AS diamond_color,
    wdi.clarity AS diamond_clarity,
    wdi.fluorescence AS diamond_fluorescence,
    wdi.edge_size_1 AS diamond_edge_size_1,
    wdi.edge_size_2 AS diamond_edge_size_2,
    wdi.carat AS diamond_carat,
    wv.category AS jewelrie_category,
    wv.applique_material AS jewelrie_applique_material,
    wv.fineness AS jewelrie_fineness,
    wv.material_color AS jewelrie_material_color,
    wv.size_type AS jewelrie_size_type,
    wv.ring_size AS jewelrie_ring_size,
    wd.design_code,
    wd.code,
    wd.erp_code,
    hv.database_updated_at AS hv_database_updated_at,
    wv.database_updated_at AS wv_database_updated_at,
    wdi.database_updated_at AS wdi_database_updated_at,
    wp.database_updated_at AS wp_database_updated_at,
    wd.database_updated_at AS wd_database_updated_at
   FROM ((((haravan.variants hv
     LEFT JOIN workplace.diamonds wdi ON ((hv.id = wdi.variant_id)))
     LEFT JOIN workplace.variants wv ON ((hv.id = wv.haravan_variant_id)))
     LEFT JOIN workplace.products wp ON ((wv.product_id = wp.id)))
     LEFT JOIN workplace.designs wd ON ((wd.id = wp.design_id)))
  WITH NO DATA;


--
-- Name: lark_warehouse_inventories; Type: TABLE; Schema: larksuite; Owner: -
--

CREATE TABLE larksuite.lark_warehouse_inventories (
    id integer NOT NULL,
    lark_record_id character varying,
    qty_onhand bigint,
    qty_committed bigint,
    qty_available bigint,
    qty_incoming bigint,
    database_created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    database_updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: promotion_approval; Type: TABLE; Schema: larksuite; Owner: -
--

CREATE TABLE larksuite.promotion_approval (
    id integer NOT NULL,
    order_code character varying,
    reason character varying,
    customer_name character varying,
    phone_number character varying,
    order_amount numeric,
    order_request_discount numeric,
    is_synced_to_crm boolean DEFAULT false,
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    submitted_date timestamp without time zone,
    instance_code character varying,
    serial_number character varying
);


--
-- Name: promotion_approval_id_seq; Type: SEQUENCE; Schema: larksuite; Owner: -
--

CREATE SEQUENCE larksuite.promotion_approval_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: promotion_approval_id_seq; Type: SEQUENCE OWNED BY; Schema: larksuite; Owner: -
--

ALTER SEQUENCE larksuite.promotion_approval_id_seq OWNED BY larksuite.promotion_approval.id;


--
-- Name: records; Type: TABLE; Schema: larksuite; Owner: -
--

CREATE TABLE larksuite.records (
    uuid uuid NOT NULL,
    record_id text NOT NULL,
    table_id text,
    app_token text,
    fields jsonb NOT NULL,
    database_created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    database_updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: temporary_products; Type: TABLE; Schema: workplace; Owner: -
--

CREATE TABLE workplace.temporary_products (
    id integer NOT NULL,
    haravan_product_id integer,
    haravan_variant_id integer,
    customer_name text,
    variant_title text,
    customer_phone character varying,
    code text,
    price numeric DEFAULT 0,
    product_information text,
    design_id integer,
    category text,
    applique_material text,
    material_color text,
    size_type text,
    ring_size numeric,
    fineness text,
    database_created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    design_code text,
    summary text,
    lark_base_record_id text,
    use_case text,
    variant_serial_id integer,
    ticket_type text,
    product_group text,
    gia_report_no text,
    ref_design_code text,
    request_code text,
    is_create_product text,
    is_notify_lark_reorder boolean
);


--
-- Name: variant_serials; Type: TABLE; Schema: workplace; Owner: -
--

CREATE TABLE workplace.variant_serials (
    id integer NOT NULL,
    variant_id bigint,
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    created_by character varying,
    updated_by character varying,
    nc_order numeric,
    serial_number text,
    printing_batch text,
    encode_barcode text,
    final_encoded_barcode text,
    old_encode_barcode text,
    old_finnal_encode_barcode text,
    gold_weight numeric,
    diamond_weight numeric,
    old_variant_id bigint,
    old_product_id bigint,
    quantity numeric,
    supplier text,
    database_updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    database_created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    cogs numeric,
    old_barcode text,
    order_on text,
    stock_id bigint,
    order_id bigint,
    storage_size_type text,
    storage_size_1 numeric,
    storage_size_2 numeric,
    note text,
    stock_at text,
    order_reference text,
    last_rfid_scan_time timestamp with time zone,
    fulfillment_status_value text,
    lark_record_id text,
    arrival_date date,
    actual_gold_price numeric,
    actual_melee_price numeric,
    actual_labor_cost numeric
);


--
-- Name: serial_numbers_view; Type: MATERIALIZED VIEW; Schema: larksuite; Owner: -
--

CREATE MATERIALIZED VIEW larksuite.serial_numbers_view AS
 SELECT wvs.id,
    wvs.serial_number,
    wvs.gold_weight,
    wvs.diamond_weight,
    wv.size_type,
    wv.ring_size,
    wvs.supplier,
    wvs.old_barcode,
    wvs.storage_size_type,
    wvs.storage_size_1,
    wvs.storage_size_2,
    wvs.stock_at,
    wvs.order_reference,
    wvs.fulfillment_status_value,
    wvs.last_rfid_scan_time,
    wvs.lark_record_id,
    wv.category,
    wv.applique_material,
    wv.fineness,
    wv.material_color,
    wv.price,
    wv.sku,
    wv.haravan_variant_id,
    wp.haravan_product_id,
    wp.haravan_product_type,
    wd.design_code,
    wd.erp_code,
    wd.code,
    wtp.customer_name,
    wtp.customer_phone,
    wtp.code AS temporary_code,
    wtp.price AS temporary_price,
    wvs.updated_at AS wvs_updated_at,
    wvs.database_updated_at AS wvs_database_updated_at,
    wv.database_updated_at AS wv_database_updated_at,
    wp.database_updated_at AS wp_database_updated_at,
    wd.database_updated_at AS wd_database_updated_at
   FROM ((((workplace.variant_serials wvs
     LEFT JOIN workplace.variants wv ON ((wvs.variant_id = wv.id)))
     LEFT JOIN workplace.products wp ON ((wv.product_id = wp.id)))
     LEFT JOIN workplace.designs wd ON ((wp.design_id = wd.id)))
     LEFT JOIN workplace.temporary_products wtp ON ((wvs.id = wtp.variant_serial_id)))
  WITH NO DATA;


--
-- Name: shifts; Type: TABLE; Schema: larksuite; Owner: -
--

CREATE TABLE larksuite.shifts (
    shift_id text NOT NULL,
    shift_name text
);


--
-- Name: user_daily_shifts; Type: TABLE; Schema: larksuite; Owner: -
--

CREATE TABLE larksuite.user_daily_shifts (
    day_no integer NOT NULL,
    group_id text NOT NULL,
    month integer NOT NULL,
    shift_id text NOT NULL,
    user_id text NOT NULL,
    database_created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: users; Type: TABLE; Schema: larksuite; Owner: -
--

CREATE TABLE larksuite.users (
    user_id text NOT NULL,
    open_id text,
    union_id text,
    name text,
    en_name text,
    email text,
    enterprise_email text,
    gender integer,
    city text,
    country text,
    department_ids text[],
    description text,
    employee_no text,
    employee_type integer,
    is_tenant_manager boolean,
    job_title text,
    join_time bigint,
    leader_user_id text,
    work_station text,
    status_is_activated boolean,
    status_is_exited boolean,
    status_is_frozen boolean,
    status_is_resigned boolean,
    status_is_unjoin boolean,
    avatar jsonb
);


--
-- Name: warehouse_inventories_lark_id_seq; Type: SEQUENCE; Schema: larksuite; Owner: -
--

CREATE SEQUENCE larksuite.warehouse_inventories_lark_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: warehouse_inventories_lark_id_seq; Type: SEQUENCE OWNED BY; Schema: larksuite; Owner: -
--

ALTER SEQUENCE larksuite.warehouse_inventories_lark_id_seq OWNED BY larksuite.lark_warehouse_inventories.id;


--
-- Name: inventory_items; Type: TABLE; Schema: misa; Owner: -
--

CREATE TABLE misa.inventory_items (
    uuid character varying NOT NULL,
    sku character varying,
    database_created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    database_updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: items; Type: TABLE; Schema: misa; Owner: -
--

CREATE TABLE misa.items (
    uuid character varying(36) NOT NULL,
    id character varying(50),
    dictionary_type integer,
    inventory_item_name character varying,
    inventory_item_code character varying,
    inventory_item_type integer,
    minimum_stock double precision,
    inventory_item_category_code_list character varying,
    inventory_item_category_name_list character varying,
    inventory_item_category_id_list character varying,
    inventory_item_category_misa_code_list character varying,
    branch_id character varying,
    discount_type integer,
    inventory_item_cost_method integer,
    unit_id character varying,
    is_unit_price_after_tax boolean,
    is_system boolean,
    inactive boolean,
    is_follow_serial_number boolean,
    is_allow_duplicate_serial_number boolean,
    purchase_discount_rate double precision,
    unit_price numeric(36,8),
    sale_price1 numeric(36,8),
    sale_price2 numeric(36,8),
    sale_price3 numeric(36,8),
    fixed_sale_price numeric(36,8),
    import_tax_rate double precision,
    export_tax_rate double precision,
    fixed_unit_price numeric(36,8),
    description text,
    inventory_account character varying,
    cogs_account character varying,
    sale_account character varying,
    unit_list jsonb,
    unit_name character varying,
    reftype integer,
    reftype_category integer,
    "quantityBarCode" integer,
    allocation_type integer,
    allocation_time integer,
    tax_reduction_type integer,
    purchase_last_unit_price numeric(36,8),
    is_specific_inventory_item boolean,
    has_delete_fixed_unit_price boolean,
    has_delete_unit_price boolean,
    has_delete_discount boolean,
    has_delete_unit_convert boolean,
    has_delete_norm boolean,
    has_delete_serial_type boolean,
    is_edit_multiple boolean,
    is_not_sync_crm boolean,
    "isUpdateRebundant" boolean,
    is_special_inv boolean,
    "isCustomPrimaryKey" boolean,
    "isFromProcessBalance" boolean,
    is_drug boolean,
    status_sync_medicine_national integer,
    is_sync_corp boolean,
    convert_rate double precision,
    is_update_main_unit boolean,
    is_image_duplicate boolean,
    is_group boolean,
    discount_value numeric(36,8),
    is_set_discount boolean,
    index_unit_convert integer,
    excel_row_index integer,
    is_valid boolean,
    created_date timestamp without time zone,
    created_by character varying,
    modified_date timestamp without time zone,
    modified_by character varying,
    auto_refno boolean,
    force_update boolean,
    state integer,
    database_created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    database_updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: purchase_voucher_details; Type: TABLE; Schema: misa; Owner: -
--

CREATE TABLE misa.purchase_voucher_details (
    uuid character varying(36) NOT NULL,
    ref_detail_id character varying(36) NOT NULL,
    refid character varying(36),
    inventory_item_id character varying(36),
    inventory_item_name character varying,
    stock_id character varying(36),
    unit_id character varying(36),
    pu_invoice_refid character varying(36),
    main_unit_id character varying(36),
    purchase_purpose_id character varying(36),
    organization_unit_id character varying(36),
    sort_order integer,
    inventory_resale_type_id integer,
    inv_date timestamp without time zone,
    date_enough_tax_payment timestamp without time zone,
    un_resonable_cost boolean,
    quantity double precision,
    unit_price numeric(36,8),
    amount_oc numeric(36,8),
    amount numeric(36,8),
    discount_rate double precision,
    discount_amount_oc numeric(36,8),
    import_charge_before_custom_amount_oc numeric(36,8),
    import_charge_before_custom_amount numeric(36,8),
    import_charge_before_custom_amount_main_currency numeric(36,8),
    allocation_rate_import_origin_currency double precision,
    import_charge_before_custom_amount_allocated numeric(36,8),
    cash_out_exchange_rate_management double precision,
    allocation_rate double precision,
    allocation_rate_import double precision,
    unit_price_after_tax numeric(36,8),
    import_charge_exchange_rate numeric(36,8),
    cash_out_diff_vat_amount_finance numeric(36,8),
    cash_out_amount_management numeric(36,8),
    cash_out_diff_amount_management numeric(36,8),
    cash_out_vat_amount_management numeric(36,8),
    cash_out_diff_vat_amount_management numeric(36,8),
    cash_out_exchange_rate_finance double precision,
    special_consume_tax_amount numeric(36,8),
    environmental_tax_amount numeric(36,8),
    environmental_tax_amount_oc numeric(36,8),
    cash_out_amount_finance numeric(36,8),
    cash_out_diff_amount_finance numeric(36,8),
    cash_out_vat_amount_finance numeric(36,8),
    import_tax_rate_price numeric(36,8),
    import_tax_rate double precision,
    import_tax_amount_oc numeric(36,8),
    import_tax_amount numeric(36,8),
    anti_dumping_tax_rate double precision,
    anti_dumping_tax_amount numeric(36,8),
    anti_dumping_tax_amount_oc numeric(36,8),
    anti_dumping_tax_account character varying,
    special_consume_tax_rate double precision,
    special_consume_tax_amount_oc numeric(36,8),
    vat_rate double precision,
    vat_amount_oc numeric(36,8),
    vat_amount numeric(36,8),
    fob_amount_oc numeric(36,8),
    fob_amount numeric(36,8),
    import_charge_amount numeric(36,8),
    discount_amount numeric(36,8),
    freight_amount numeric(36,8),
    inward_amount numeric(36,8),
    main_convert_rate double precision,
    main_quantity double precision,
    main_unit_price numeric(36,8),
    description text,
    debit_account character varying,
    credit_account character varying,
    exchange_rate_operator character varying,
    vat_account character varying,
    inv_no character varying,
    import_tax_account character varying,
    special_consume_tax_account character varying,
    environmental_tax_account character varying,
    vat_description text,
    stock_code character varying,
    inventory_item_code character varying,
    main_unit_name character varying,
    organization_unit_code character varying,
    organization_unit_name character varying,
    unit_name character varying,
    edit_version bigint,
    purchase_purpose_code character varying,
    inventory_item_type integer,
    purchase_purpose_name text,
    pu_order_refno character varying,
    pu_order_code character varying,
    is_follow_serial_number boolean,
    is_allow_duplicate_serial_number boolean,
    is_description boolean,
    panel_height_quantity double precision,
    panel_length_quantity double precision,
    panel_quantity double precision,
    panel_radius_quantity double precision,
    panel_width_quantity double precision,
    inventory_item_cogs_account character varying,
    inventory_account character varying,
    unit_list text,
    import_tax_rate_price_origin numeric(36,8),
    quantity_product_produce double precision,
    database_created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    database_updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: purchase_vouchers; Type: TABLE; Schema: misa; Owner: -
--

CREATE TABLE misa.purchase_vouchers (
    uuid character varying(36) NOT NULL,
    refid character varying(50),
    branch_id character varying(36),
    account_object_id character varying(36),
    reftype integer,
    display_on_book integer,
    refdate timestamp without time zone,
    posted_date timestamp without time zone,
    caba_refdate timestamp without time zone,
    caba_posted_date timestamp without time zone,
    created_date timestamp without time zone,
    modified_date timestamp without time zone,
    is_posted_finance boolean,
    is_posted_management boolean,
    is_posted_cash_book_finance boolean,
    is_posted_cash_book_management boolean,
    is_posted_inventory_book_finance boolean,
    is_posted_inventory_book_management boolean,
    total_amount_oc numeric(36,8),
    total_amount numeric(36,8),
    total_import_tax_amount_oc numeric(36,8),
    total_import_tax_amount numeric(36,8),
    total_vat_amount_oc numeric(36,8),
    total_special_consume_tax_amount numeric(36,8),
    total_custom_before_amount numeric(36,8),
    caba_amount_oc numeric(36,8),
    caba_amount numeric(36,8),
    total_vat_amount numeric(36,8),
    total_discount_amount_oc numeric(36,8),
    total_discount_amount numeric(36,8),
    total_freight_amount numeric(36,8),
    total_inward_amount numeric(36,8),
    total_special_consume_tax_amount_oc numeric(36,8),
    total_payment_amount numeric(36,8),
    total_payment_amount_oc numeric(36,8),
    total_environmental_tax_amount numeric(36,8),
    refno_finance character varying,
    account_object_name character varying,
    account_object_address character varying,
    created_by character varying,
    modified_by character varying,
    journal_memo text,
    account_object_code character varying,
    paid_status integer,
    include_invoice integer,
    branch_name character varying,
    edit_version bigint,
    currency_id character varying,
    exchange_rate double precision,
    account_object_tax_code character varying,
    is_freight_service boolean,
    employee_id character varying(36),
    in_outward_refno character varying,
    status_sync_medicine_national integer,
    discount_type integer,
    employee_name character varying,
    employee_code character varying,
    total_anti_dumping_tax_amount numeric(36,8),
    total_anti_dumping_tax_amount_oc numeric(36,8),
    wesign_document_text text,
    database_created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    database_updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: purchase_vouchers_view; Type: MATERIALIZED VIEW; Schema: misa; Owner: -
--

CREATE MATERIALIZED VIEW misa.purchase_vouchers_view AS
 SELECT v.refno_finance,
    v.created_date,
    v.modified_date,
    v.refdate,
    v.posted_date,
    v.total_amount_oc,
    v.total_amount,
    v.total_import_tax_amount_oc,
    v.total_import_tax_amount,
    v.total_vat_amount_oc,
    v.total_special_consume_tax_amount,
    v.total_custom_before_amount,
    v.total_vat_amount,
    v.total_payment_amount,
    v.account_object_name,
    v.account_object_address,
    v.created_by,
    v.modified_by,
    v.journal_memo,
    v.account_object_code,
    v.paid_status,
    v.branch_name,
    v.exchange_rate,
    v.in_outward_refno,
    v.employee_name,
    v.employee_code,
    vd.uuid,
    vd.ref_detail_id,
    vd.refid,
    vd.inventory_item_id,
    vd.inventory_item_name,
    vd.stock_id,
    vd.unit_id,
    vd.pu_invoice_refid,
    vd.main_unit_id,
    vd.purchase_purpose_id,
    vd.organization_unit_id,
    vd.sort_order,
    vd.inventory_resale_type_id,
    vd.inv_date,
    vd.date_enough_tax_payment,
    vd.un_resonable_cost,
    vd.quantity,
    vd.unit_price,
    vd.amount_oc,
    vd.amount,
    vd.discount_rate,
    vd.discount_amount_oc,
    vd.import_charge_before_custom_amount_oc,
    vd.import_charge_before_custom_amount,
    vd.import_charge_before_custom_amount_main_currency,
    vd.allocation_rate_import_origin_currency,
    vd.import_charge_before_custom_amount_allocated,
    vd.cash_out_exchange_rate_management,
    vd.allocation_rate,
    vd.allocation_rate_import,
    vd.unit_price_after_tax,
    vd.import_charge_exchange_rate,
    vd.cash_out_diff_vat_amount_finance,
    vd.cash_out_amount_management,
    vd.cash_out_diff_amount_management,
    vd.cash_out_vat_amount_management,
    vd.cash_out_diff_vat_amount_management,
    vd.cash_out_exchange_rate_finance,
    vd.special_consume_tax_amount,
    vd.environmental_tax_amount,
    vd.environmental_tax_amount_oc,
    vd.cash_out_amount_finance,
    vd.cash_out_diff_amount_finance,
    vd.cash_out_vat_amount_finance,
    vd.import_tax_rate_price,
    vd.import_tax_rate,
    vd.import_tax_amount_oc,
    vd.import_tax_amount,
    vd.anti_dumping_tax_rate,
    vd.anti_dumping_tax_amount,
    vd.anti_dumping_tax_amount_oc,
    vd.anti_dumping_tax_account,
    vd.special_consume_tax_rate,
    vd.special_consume_tax_amount_oc,
    vd.vat_rate,
    vd.vat_amount_oc,
    vd.vat_amount,
    vd.fob_amount_oc,
    vd.fob_amount,
    vd.import_charge_amount,
    vd.discount_amount,
    vd.freight_amount,
    vd.inward_amount,
    vd.main_convert_rate,
    vd.main_quantity,
    vd.main_unit_price,
    vd.description,
    vd.debit_account,
    vd.credit_account,
    vd.exchange_rate_operator,
    vd.vat_account,
    vd.inv_no,
    vd.import_tax_account,
    vd.special_consume_tax_account,
    vd.environmental_tax_account,
    vd.vat_description,
    vd.stock_code,
    vd.inventory_item_code,
    vd.main_unit_name,
    vd.organization_unit_code,
    vd.organization_unit_name,
    vd.unit_name,
    vd.edit_version,
    vd.purchase_purpose_code,
    vd.inventory_item_type,
    vd.purchase_purpose_name,
    vd.pu_order_refno,
    vd.pu_order_code,
    vd.is_follow_serial_number,
    vd.is_allow_duplicate_serial_number,
    vd.is_description,
    vd.panel_height_quantity,
    vd.panel_length_quantity,
    vd.panel_quantity,
    vd.panel_radius_quantity,
    vd.panel_width_quantity,
    vd.inventory_item_cogs_account,
    vd.inventory_account,
    vd.unit_list,
    vd.import_tax_rate_price_origin,
    vd.quantity_product_produce,
    vd.database_created_at,
    vd.database_updated_at
   FROM (misa.purchase_vouchers v
     LEFT JOIN misa.purchase_voucher_details vd ON (((v.refid)::text = (vd.refid)::text)))
  WHERE (length((vd.inventory_item_code)::text) > 10)
  WITH NO DATA;


--
-- Name: users; Type: TABLE; Schema: misa; Owner: -
--

CREATE TABLE misa.users (
    uuid uuid NOT NULL,
    employee_code character varying(255),
    haravan_id bigint NOT NULL,
    email character varying(255),
    database_created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP,
    database_updated_at timestamp(3) without time zone
);


--
-- Name: warehouse_inventories; Type: TABLE; Schema: misa; Owner: -
--

CREATE TABLE misa.warehouse_inventories (
    uuid character varying(36) NOT NULL,
    inventory_item_id character varying(36) NOT NULL,
    inventory_item_code character varying(50),
    inventory_item_name character varying(255),
    stock_id character varying(36) NOT NULL,
    stock_code character varying(50),
    stock_name character varying(255),
    organization_unit_id character varying(36),
    organization_unit_code character varying(50),
    organization_unit_name character varying(255),
    quantity_balance double precision,
    amount_balance numeric(36,2),
    unit_price numeric(36,2),
    database_created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    database_updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: conversation_page_customer; Type: TABLE; Schema: pancake; Owner: -
--

CREATE TABLE pancake.conversation_page_customer (
    uuid character varying,
    customer_id character varying NOT NULL,
    conversation_id character varying NOT NULL,
    database_created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    database_updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: frappe_lead_conversation; Type: TABLE; Schema: pancake; Owner: -
--

CREATE TABLE pancake.frappe_lead_conversation (
    conversation_id character varying NOT NULL,
    frappe_name_id character varying,
    updated_at timestamp without time zone,
    created_at timestamp without time zone
);


--
-- Name: frappe_lead_conversation_stag; Type: TABLE; Schema: pancake; Owner: -
--

CREATE TABLE pancake.frappe_lead_conversation_stag (
    conversation_id character varying NOT NULL,
    frappe_name_id character varying,
    updated_at timestamp without time zone,
    created_at timestamp without time zone
);


--
-- Name: messages; Type: TABLE; Schema: pancake; Owner: -
--

CREATE TABLE pancake.messages (
    id character varying NOT NULL,
    message character varying,
    type character varying,
    seen boolean,
    show_info boolean,
    from_id character varying,
    from_name character varying,
    attachments json,
    inserted_at timestamp without time zone,
    page_id character varying,
    conversation_id character varying,
    has_phone boolean,
    is_removed boolean,
    can_hide boolean,
    comment_count integer,
    like_count integer,
    parent_id character varying,
    is_hidden boolean,
    rich_message character varying,
    edit_history character varying,
    message_tags json,
    is_parent_hidden boolean,
    can_comment boolean,
    can_like boolean,
    can_remove boolean,
    can_reply_privately boolean,
    is_livestream_order boolean,
    is_parent boolean,
    phone_info json,
    original_message character varying
);


--
-- Name: pancake_user; Type: TABLE; Schema: pancake; Owner: -
--

CREATE TABLE pancake.pancake_user (
    id character varying NOT NULL,
    name character varying,
    status character varying,
    fb_id character varying,
    page_permissions jsonb,
    status_round_robin character varying,
    status_in_page character varying,
    is_online boolean,
    database_updated_at timestamp without time zone,
    database_created_at timestamp without time zone
);


--
-- Name: tag_page; Type: TABLE; Schema: pancake; Owner: -
--

CREATE TABLE pancake.tag_page (
    page_id character varying NOT NULL,
    id integer NOT NULL,
    tag_label character varying,
    description character varying,
    database_created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    database_updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: users; Type: TABLE; Schema: pancake; Owner: -
--

CREATE TABLE pancake.users (
    id text NOT NULL,
    enterprise_email text
);


--
-- Name: manual_payments; Type: TABLE; Schema: payment; Owner: -
--

CREATE TABLE payment.manual_payments (
    uuid uuid NOT NULL,
    payment_type character varying(255),
    branch character varying(255),
    shipping_code character varying(255),
    send_date timestamp(6) without time zone,
    receive_date timestamp(6) without time zone,
    created_date timestamp(6) without time zone,
    updated_date timestamp(6) without time zone,
    bank_account character varying(255),
    bank_name character varying(255),
    transfer_amount numeric(18,6),
    transfer_note text,
    haravan_order_id integer,
    haravan_order_name character varying(255),
    transfer_status character varying(255),
    lark_record_id character varying(255),
    misa_synced boolean DEFAULT false NOT NULL,
    misa_sync_guid character varying(255),
    misa_sync_error_msg text,
    misa_synced_at timestamp(6) without time zone
);


--
-- Name: sepay_transaction; Type: TABLE; Schema: payment; Owner: -
--

CREATE TABLE payment.sepay_transaction (
    id character varying(50) NOT NULL,
    bank_brand_name character varying,
    account_number character varying,
    transaction_date character varying,
    amount_out character varying,
    amount_in character varying,
    accumulated character varying,
    transaction_content text,
    reference_number character varying,
    code character varying,
    sub_account character varying,
    bank_account_id character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    lark_record_id character varying(255)
);


--
-- Name: purchase_exchange_policy; Type: TABLE; Schema: policy; Owner: -
--

CREATE TABLE policy.purchase_exchange_policy (
    order_id character varying(50) NOT NULL,
    item_id character varying(50) NOT NULL,
    order_code character varying(50),
    sku character varying(50),
    item_name character varying(255),
    barcode character varying(50),
    policy_id character varying(50),
    policy_name character varying
);


--
-- Name: purchase_exchange_policy_view; Type: MATERIALIZED VIEW; Schema: policy; Owner: -
--

CREATE MATERIALIZED VIEW policy.purchase_exchange_policy_view AS
 WITH line_item_bizfly AS (
         SELECT orders.id AS bizfly_crm_id,
            orders.order_code,
            orders.haravan_id,
            orders.customer_type_value AS customer_type,
            orders.financial_status_value,
            orders.fulfillment_status_value,
            orders.purpose_label,
            orders.product_category_label,
            orders.customer_id,
            (order_data_item_element.value ->> '_id'::text) AS item_id,
            (order_data_item_element.value ->> 'barcode'::text) AS barcode,
            (order_data_item_element.value ->> 'sku'::text) AS sku
           FROM (bizflycrm.orders
             LEFT JOIN LATERAL jsonb_array_elements(
                CASE
                    WHEN (jsonb_typeof(orders.order_data_item) = 'array'::text) THEN orders.order_data_item
                    ELSE '[]'::jsonb
                END) order_data_item_element(value) ON (true))
          WHERE (orders.order_data_item IS NOT NULL)
          ORDER BY orders.id
        )
 SELECT ho.id,
    ho.order_number,
    ho.total_price,
    ho.created_at,
    ((haravan.get_real_created_at(ho.id) AT TIME ZONE 'UTC'::text) AT TIME ZONE 'Asia/Ho_Chi_Minh'::text) AS real_created_at,
    hli.variant_id,
    hli.sku,
    hli.barcode,
    hli.title,
    hli.type,
    hli.price,
    hli.price_original,
    hli.price_promotion,
    lib.bizfly_crm_id,
    lib.customer_type,
    lib.financial_status_value,
    lib.fulfillment_status_value,
    lib.purpose_label,
    lib.product_category_label,
    lib.customer_id,
    lib.item_id,
    bc.ma_khach_hang,
    bc.first_channel_label,
    pp.policy_id,
    pp.policy_name
   FROM ((((haravan.orders ho
     LEFT JOIN haravan.line_items hli ON ((ho.id = hli.order_id)))
     LEFT JOIN line_item_bizfly lib ON ((((ho.id)::text = (lib.haravan_id)::text) AND ((hli.sku)::text = lib.sku))))
     LEFT JOIN bizflycrm.customers bc ON (((lib.customer_id)::text = (bc.id)::text)))
     LEFT JOIN policy.purchase_exchange_policy pp ON ((((lib.bizfly_crm_id)::text = (pp.order_id)::text) AND (lib.item_id = (pp.item_id)::text))))
  WHERE ((((ho.source)::text !~~ '%bhsc%'::text) OR ((ho.source)::text = ANY ((ARRAY['harafunnel'::character varying, 'sendo'::character varying])::text[]))) AND ((ho.cancelled_status)::text = 'uncancelled'::text) AND ((ho.confirmed_status)::text = 'confirmed'::text) AND (ho.total_price > (120000)::numeric))
  WITH NO DATA;


--
-- Name: order_promotion_analysis; Type: TABLE; Schema: promotion; Owner: -
--

CREATE TABLE promotion.order_promotion_analysis (
    uuid uuid NOT NULL,
    order_code character varying,
    variant_id bigint,
    price bigint,
    promotion_name character varying,
    priority_order character varying,
    price_before_promotion bigint,
    price_after_promotion bigint,
    calculated_sale_price bigint,
    actual_sale_price bigint,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: order_promotions; Type: TABLE; Schema: promotion; Owner: -
--

CREATE TABLE promotion.order_promotions (
    uuid character varying(36) NOT NULL,
    id character varying(50),
    haravan_id character varying(50),
    order_code character varying(50),
    real_created_at timestamp without time zone,
    order_created_on timestamp without time zone,
    sub_total_price numeric(36,8),
    total_price numeric(36,8),
    updated_at timestamp without time zone,
    promotion_order jsonb,
    promotion_item jsonb,
    database_created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    database_updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: promotions_item_view; Type: MATERIALIZED VIEW; Schema: promotion; Owner: -
--

CREATE MATERIALIZED VIEW promotion.promotions_item_view AS
 SELECT pop.id,
    bo.id AS haravan_id,
    bo.cancelled_status,
    bo.source_name,
    bo.name AS order_code,
    haravan.get_real_created_at(bo.id) AS real_created_at,
    pop.order_created_on,
    pop.sub_total_price,
    pop.total_price,
    pop.updated_at,
    (promotion_item_element.value ->> 'item_id'::text) AS item_id,
    (promotion_item_element.value ->> 'item_name'::text) AS item_name,
    (promotion_item_element.value ->> 'variant_id'::text) AS variant_id,
    (promotion_item_element.value ->> 'original_price'::text) AS original_price,
    (promotion_item_element.value ->> 'final_price'::text) AS final_price,
    (promotion_item_element.value ->> 'quantity'::text) AS quantity,
    (promotion_item_element.value ->> 'promotion_id'::text) AS promotion_id,
    (promotion_item_element.value ->> 'promotion_scope_label'::text) AS promotion_scope_label,
    (promotion_item_element.value ->> 'promotion_description_value'::text) AS promotion_description_value,
    (promotion_item_element.value ->> 'discount_percentage'::text) AS discount_percentage,
    (promotion_item_element.value ->> 'discount_amount'::text) AS discount_amount,
    (promotion_item_element.value ->> 'name_value'::text) AS promotion_name,
    (promotion_item_element.value ->> 'discount_group_label'::text) AS discount_group_label,
    (promotion_item_element.value ->> 'type_of_promotion_value'::text) AS type_of_promotion_value,
    (promotion_item_element.value ->> 'priority'::text) AS priority,
    (promotion_item_element.value ->> '_before_discounted_price'::text) AS _before_discounted_price,
    (promotion_item_element.value ->> 'before_discounted_price'::text) AS before_discounted_price,
    (promotion_item_element.value ->> 'after_discounted_price'::text) AS after_discounted_price,
    (promotion_item_element.value ->> '_final_discounted_price'::text) AS _final_discounted_price
   FROM ((haravan.orders bo
     LEFT JOIN promotion.order_promotions pop ON (((bo.id)::text = (pop.haravan_id)::text)))
     LEFT JOIN LATERAL jsonb_array_elements(
        CASE
            WHEN (jsonb_typeof(pop.promotion_item) = 'array'::text) THEN pop.promotion_item
            ELSE '[]'::jsonb
        END) promotion_item_element(value) ON (true))
  WITH NO DATA;


--
-- Name: promotions_order_view; Type: MATERIALIZED VIEW; Schema: promotion; Owner: -
--

CREATE MATERIALIZED VIEW promotion.promotions_order_view AS
 SELECT pop.id,
    bo.id AS haravan_id,
    bo.cancelled_status,
    bo.source_name,
    bo.name AS order_code,
    haravan.get_real_created_at(bo.id) AS real_created_at,
    pop.order_created_on,
    pop.sub_total_price,
    pop.total_price,
    pop.updated_at,
    (promotion_order_element.value ->> 'promotion_id'::text) AS promotion_id,
    (promotion_order_element.value ->> 'promotion_scope_label'::text) AS promotion_scope_label,
    (promotion_order_element.value ->> 'promotion_description_value'::text) AS promotion_description_value,
    (promotion_order_element.value ->> 'discount_percentage'::text) AS discount_percentage,
    (promotion_order_element.value ->> 'discount_amount'::text) AS discount_amount,
    (promotion_order_element.value ->> 'name_value'::text) AS promotion_name,
    (promotion_order_element.value ->> 'discount_group_label'::text) AS discount_group_label,
    (promotion_order_element.value ->> 'type_of_promotion_value'::text) AS type_of_promotion_value,
    (promotion_order_element.value ->> 'priority'::text) AS priority,
    (promotion_order_element.value ->> '_before_discounted_price'::text) AS _before_discounted_price,
    (promotion_order_element.value ->> 'before_discounted_price'::text) AS before_discounted_price,
    (promotion_order_element.value ->> 'after_discounted_price'::text) AS after_discounted_price,
    (promotion_order_element.value ->> '_final_discounted_price'::text) AS _final_discounted_price
   FROM ((haravan.orders bo
     LEFT JOIN promotion.order_promotions pop ON (((bo.id)::text = (pop.haravan_id)::text)))
     LEFT JOIN LATERAL jsonb_array_elements(
        CASE
            WHEN (jsonb_typeof(pop.promotion_order) = 'array'::text) THEN pop.promotion_order
            ELSE '[]'::jsonb
        END) promotion_order_element(value) ON (true))
  WITH NO DATA;


--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


--
-- Name: base_cache_signaling; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.base_cache_signaling
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: base_registry_signaling; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.base_registry_signaling
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ir_sequence_001; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ir_sequence_001
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ir_sequence_002; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ir_sequence_002
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ir_sequence_003; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ir_sequence_003
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ir_sequence_004; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ir_sequence_004
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ir_sequence_005; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ir_sequence_005
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ir_sequence_006; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ir_sequence_006
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ir_sequence_007; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ir_sequence_007
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ir_sequence_008; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ir_sequence_008
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ir_sequence_009; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ir_sequence_009
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ir_sequence_010; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ir_sequence_010
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ir_sequence_011; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ir_sequence_011
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ir_sequence_012; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ir_sequence_012
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ir_sequence_013; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ir_sequence_013
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ir_sequence_014; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ir_sequence_014
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ir_sequence_014_013; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ir_sequence_014_013
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ir_sequence_014_019; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ir_sequence_014_019
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ir_sequence_014_030; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ir_sequence_014_030
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ir_sequence_014_033; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ir_sequence_014_033
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ir_sequence_015; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ir_sequence_015
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ir_sequence_015_015; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ir_sequence_015_015
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ir_sequence_015_022; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ir_sequence_015_022
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ir_sequence_015_028; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ir_sequence_015_028
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ir_sequence_015_036; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ir_sequence_015_036
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ir_sequence_016; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ir_sequence_016
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ir_sequence_017; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ir_sequence_017
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ir_sequence_018; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ir_sequence_018
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ir_sequence_019; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ir_sequence_019
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ir_sequence_020; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ir_sequence_020
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ir_sequence_021; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ir_sequence_021
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ir_sequence_022; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ir_sequence_022
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ir_sequence_035; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ir_sequence_035
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ir_sequence_036; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ir_sequence_036
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ir_sequence_037; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ir_sequence_037
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ir_sequence_038; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ir_sequence_038
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ir_sequence_039; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ir_sequence_039
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ir_sequence_040; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ir_sequence_040
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ir_sequence_041; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ir_sequence_041
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ir_sequence_042; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ir_sequence_042
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ir_sequence_043; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ir_sequence_043
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ir_sequence_044; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ir_sequence_044
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ir_sequence_045; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ir_sequence_045
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ir_sequence_046; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ir_sequence_046
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ir_sequence_047; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ir_sequence_047
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ir_sequence_048; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ir_sequence_048
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ir_sequence_049; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ir_sequence_049
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ir_sequence_050; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ir_sequence_050
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ir_sequence_051; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ir_sequence_051
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ir_sequence_052; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ir_sequence_052
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ir_sequence_053; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ir_sequence_053
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ir_sequence_054; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ir_sequence_054
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ir_sequence_055; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ir_sequence_055
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ir_sequence_056; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ir_sequence_056
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ir_sequence_057; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ir_sequence_057
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ir_sequence_058; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ir_sequence_058
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ir_sequence_059; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ir_sequence_059
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ir_sequence_060; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ir_sequence_060
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ir_sequence_061; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ir_sequence_061
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ir_sequence_062; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ir_sequence_062
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ir_sequence_064; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ir_sequence_064
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ir_sequence_065; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ir_sequence_065
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ir_sequence_066; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ir_sequence_066
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ir_sequence_067; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ir_sequence_067
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ir_sequence_068; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ir_sequence_068
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ir_sequence_069; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ir_sequence_069
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ir_sequence_070; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ir_sequence_070
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ir_sequence_071; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ir_sequence_071
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ir_sequence_072; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ir_sequence_072
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ir_sequence_073; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ir_sequence_073
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ir_sequence_074; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ir_sequence_074
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ir_sequence_075; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ir_sequence_075
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ir_sequence_076; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ir_sequence_076
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ir_sequence_077; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ir_sequence_077
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ir_sequence_078; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ir_sequence_078
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ir_sequence_079; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ir_sequence_079
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ir_sequence_080; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ir_sequence_080
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: diamonds_dev; Type: TABLE; Schema: rapnet; Owner: -
--

CREATE TABLE rapnet.diamonds_dev (
    diamond_id character varying NOT NULL,
    gia_report_no character varying,
    price numeric,
    country character varying,
    is_available boolean,
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    gia_info jsonb,
    sent_event jsonb,
    shade character varying,
    key_to_symbols character varying,
    inclusions character varying,
    diamond_data jsonb
);


--
-- Name: diamonds_prod; Type: TABLE; Schema: rapnet; Owner: -
--

CREATE TABLE rapnet.diamonds_prod (
    diamond_id character varying NOT NULL,
    gia_report_no character varying,
    price numeric,
    country character varying,
    is_available boolean,
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    gia_info jsonb,
    sent_event jsonb,
    shade character varying,
    key_to_symbols character varying,
    inclusions character varying,
    diamond_data jsonb
);


--
-- Name: sales_person_view; Type: MATERIALIZED VIEW; Schema: reporting; Owner: -
--

CREATE MATERIALIZED VIEW reporting.sales_person_view AS
 SELECT sp.name,
    sp.sales_person_name,
    sp.employee,
    sp.bizfly_id,
    ee.user_id,
    er.region_name,
    ee.status,
    eu.pancake_id,
    eu.user_image,
    eu.time_zone,
    hu.id AS haravan_id,
    split_part(_sp.sales_person_name, ' - '::text, 1) AS city,
    split_part(_sp.sales_person_name, ' - '::text, 2) AS branch,
    split_part(_sp.sales_person_name, ' - '::text, 3) AS "position"
   FROM (((((erpnext.sales_persons sp
     LEFT JOIN erpnext.employees ee ON ((sp.employee = ee.name)))
     LEFT JOIN erpnext.users eu ON ((ee.user_id = eu.name)))
     LEFT JOIN erpnext.regions er ON ((sp.sales_region = (er.name)::text)))
     LEFT JOIN erpnext.sales_persons _sp ON ((sp.parent_sales_person = _sp.name)))
     LEFT JOIN haravan.users hu ON ((ee.user_id = (hu.email)::text)))
  WHERE (sp.is_group = 0)
  WITH NO DATA;


--
-- Name: target_view; Type: MATERIALIZED VIEW; Schema: reporting; Owner: -
--

CREATE MATERIALIZED VIEW reporting.target_view AS
 SELECT name,
    employee,
    to_char((to_date(target_month, 'YYYY/MM'::text))::timestamp with time zone, 'MM-YYYY'::text) AS target_month,
    target_amount,
    sales_person_name,
    (to_timestamp((target_month || '/01 00:00:00'::text), 'YYYY/MM/DD'::text))::timestamp without time zone AS month_start,
    ((((to_date((target_month || '/01'::text), 'YYYY/MM/DD'::text) + '1 mon'::interval) - '1 day'::interval))::date)::timestamp without time zone AS month_end
   FROM ( SELECT sp.uuid,
            sp.name,
            sp.employee,
            sp.bizfly_id,
            sp.creation,
            sp.department,
            sp.enabled,
            sp.is_group,
            sp.modified,
            sp.modified_by,
            sp.old_parent,
            sp.parent_sales_person,
            sp.sales_person_name,
            sp.sales_region,
            sp.targets,
            target_elements.value,
            (target_elements.value ->> 'fiscal_year'::text) AS fiscal_year,
            ((target_elements.value ->> 'target_amount'::text))::numeric AS target_amount,
            split_part((target_elements.value ->> 'distribution_id'::text), ' '::text, 3) AS target_month
           FROM erpnext.sales_persons sp,
            LATERAL jsonb_array_elements(sp.targets) target_elements(value)
          WHERE ((sp.is_group = 0) AND (sp.targets <> '[]'::jsonb))) rsp
  WITH NO DATA;


--
-- Name: daily_target_view; Type: MATERIALIZED VIEW; Schema: reporting; Owner: -
--

CREATE MATERIALIZED VIEW reporting.daily_target_view AS
 WITH date_range AS (
         SELECT target_view.name,
            target_view.month_start,
            target_view.month_end,
            target_view.target_amount,
            target_view.target_month,
            generate_series(target_view.month_start, target_view.month_end, '1 day'::interval) AS date
           FROM reporting.target_view
        )
 SELECT dr.name,
    sp.status,
    dr.date AS created_at,
    dr.target_month,
    sp.sales_person_name,
    sp.city,
    sp.branch,
    sp."position",
        CASE
            WHEN (dr.date = dr.month_end) THEN ((dr.target_amount)::double precision - (((dr.target_amount)::double precision / ((EXTRACT(day FROM (dr.month_end - dr.month_start)) + (1)::numeric))::double precision) * (EXTRACT(day FROM (dr.month_end - dr.month_start)))::double precision))
            ELSE ((dr.target_amount)::double precision / ((EXTRACT(day FROM (dr.month_end - dr.month_start)) + (1)::numeric))::double precision)
        END AS daily_target
   FROM (date_range dr
     LEFT JOIN reporting.sales_person_view sp ON ((sp.name = dr.name)))
  WITH NO DATA;


--
-- Name: debt_history_view; Type: MATERIALIZED VIEW; Schema: reporting; Owner: -
--

CREATE MATERIALIZED VIEW reporting.debt_history_view AS
 SELECT eso.name,
    eso.order_number,
    (debt_history.value ->> 'date'::text) AS debt_date,
    (debt_history.value ->> 'name'::text) AS debt_name,
    (debt_history.value ->> 'owner'::text) AS debt_owner,
    (debt_history.value ->> 'status'::text) AS debt_status,
    (debt_history.value ->> 'added_on'::text) AS debt_added_on,
    (debt_history.value ->> 'creation'::text) AS debt_creation,
    (debt_history.value ->> 'notify_to'::text) AS notify_to,
    (debt_history.value ->> 'note'::text) AS note
   FROM erpnext.sales_orders eso,
    LATERAL jsonb_array_elements(eso.debt_histories) debt_history(value)
  WITH NO DATA;


--
-- Name: item_promotion_view; Type: MATERIALIZED VIEW; Schema: reporting; Owner: -
--

CREATE MATERIALIZED VIEW reporting.item_promotion_view AS
 SELECT eso.haravan_order_id AS haravan_id,
    eso.order_number AS order_code,
    COALESCE(eso.real_order_date, eso.creation) AS real_created_at,
    eso.creation AS order_created_on,
    eso.modified AS updated_at,
    eso.total,
    eso.source,
    eso.source_name,
    eso.cancelled_status,
    eso.financial_status,
    eso.fulfillment_status,
    eso.expected_delivery_date,
    eso.customer_type,
    eso.customer_name,
    (sales_order_items.value ->> 'name'::text) AS item_id,
    (sales_order_items.value ->> 'variant_title'::text) AS variant_title,
    (sales_order_items.value ->> 'item_name'::text) AS item_name,
    (sales_order_items.value ->> 'haravan_variant_id'::text) AS variant_id,
    (sales_order_items.value ->> 'sku'::text) AS sku,
    (sales_order_items.value ->> 'stock_qty'::text) AS quantity,
    (sales_order_items.value ->> 'price_list_rate'::text) AS original_price,
    (sales_order_items.value ->> 'amount'::text) AS final_price,
    unnested.promotions AS promotion_id,
        CASE ep.scope
            WHEN 'Order'::text THEN 'Đơn hàng'::text
            WHEN 'Line Item'::text THEN 'Sản phẩm'::text
            ELSE ''::text
        END AS promotion_scope_label,
    ep.title AS promotion_description_value,
    ''::text AS discount_group_label,
    ep.discount_percent AS discount_percentage,
    ep.discount_amount,
    ''::text AS promotion_name,
    ''::text AS type_of_promotion_value,
    (regexp_replace((COALESCE(ep.priority, '0'::character varying))::text, '[^0-9]'::text, ''::text, 'g'::text))::integer AS priority,
    ''::text AS discount_duration_label,
    unnested.promotion_priority
   FROM (((erpnext.sales_orders eso
     LEFT JOIN LATERAL jsonb_array_elements(eso.items) sales_order_items(value) ON (true))
     CROSS JOIN LATERAL ( SELECT t.promo,
            t.priority
           FROM UNNEST(ARRAY[(sales_order_items.value ->> 'promotion_1'::text), (sales_order_items.value ->> 'promotion_2'::text), (sales_order_items.value ->> 'promotion_3'::text), (sales_order_items.value ->> 'promotion_4'::text)], ARRAY[1, 2, 3, 4]) t(promo, priority)
          WHERE (t.promo IS NOT NULL)
        UNION ALL
         SELECT NULL::text AS text,
            1
          WHERE (((sales_order_items.value ->> 'promotion_1'::text) IS NULL) AND ((sales_order_items.value ->> 'promotion_2'::text) IS NULL) AND ((sales_order_items.value ->> 'promotion_3'::text) IS NULL) AND ((sales_order_items.value ->> 'promotion_4'::text) IS NULL))) unnested(promotions, promotion_priority))
     LEFT JOIN erpnext.promotions ep ON (((ep.name)::text = unnested.promotions)))
  WITH NO DATA;


--
-- Name: line_item_view; Type: MATERIALIZED VIEW; Schema: reporting; Owner: -
--

CREATE MATERIALIZED VIEW reporting.line_item_view AS
 SELECT hli.id AS line_item_id,
    hli.order_id,
    hli.fulfillment_service,
    hli.fulfillment_status AS line_item_fulfillment_status,
    hli.price,
    hli.price_original,
    hli.price_promotion,
    hli.quantity,
    hli.product_id,
    hli.sku,
    hli.title,
    hli.variant_id,
    hli.variant_title,
    hli.vendor,
    hli.type,
    hli.barcode,
    hli.total_discount,
    wdi.report_lab,
    wdi.report_no,
    wdi.shape AS diamond_shape,
    wdi.cut AS diamond_cut,
    wdi.color AS diamond_color,
    wdi.clarity AS diamond_clarity,
    wdi.fluorescence AS diamond_fluorescence,
    wdi.edge_size_1 AS diamond_edge_size_1,
    wdi.edge_size_2 AS diamond_edge_size_2,
    wdi.carat AS diamond_carat,
    wv.category AS jewelrie_category,
    wv.applique_material AS jewelrie_applique_material,
    wv.fineness AS jewelrie_fineness,
    wv.material_color AS jewelrie_material_color,
    wv.size_type AS jewelrie_size_type,
    wv.ring_size AS jewelrie_ring_size,
    wd.design_code,
    wd.code,
    wd.erp_code,
    wd.design_type,
    wd.gender AS design_gender,
    wd.design_year,
    wd.diamond_holder,
    wd.source AS design_source,
    wd.pick_up AS design_pick_up,
    COALESCE(wd.created_date, date(wd.database_created_at)) AS design_created_at,
    wd.ring_band_type,
    wd.ring_band_style,
    wd.ring_head_style,
    wd.jewelry_rd_style,
    wd.product_line,
    erp_line_items.product_availability_status,
    erp_line_items.name AS test_name,
    COALESCE(( SELECT (jsonb_array_elements((wd.image_render)::jsonb) ->> 'url'::text)
         LIMIT 1), 'https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg'::text) AS design_image
   FROM (((((haravan.line_items hli
     LEFT JOIN workplace.diamonds wdi ON ((hli.variant_id = wdi.variant_id)))
     LEFT JOIN workplace.variants wv ON ((hli.variant_id = wv.haravan_variant_id)))
     LEFT JOIN workplace.products wp ON ((wv.product_id = wp.id)))
     LEFT JOIN workplace.designs wd ON ((wd.id = wp.design_id)))
     LEFT JOIN ( SELECT so.name,
            (so.haravan_order_id)::integer AS haravan_order_id,
            ((sales_order_items.value ->> 'haravan_variant_id'::text))::integer AS haravan_variant_id,
            (sales_order_items.value ->> 'product_availability_status'::text) AS product_availability_status
           FROM erpnext.sales_orders so,
            LATERAL jsonb_array_elements(so.items) sales_order_items(value)) erp_line_items ON (((hli.variant_id = erp_line_items.haravan_variant_id) AND (hli.order_id = erp_line_items.haravan_order_id))))
  WITH NO DATA;


--
-- Name: sales_order_dim; Type: MATERIALIZED VIEW; Schema: reporting; Owner: -
--

CREATE MATERIALIZED VIEW reporting.sales_order_dim AS
 SELECT ho.id,
    ((haravan.get_real_created_at(ho.id) AT TIME ZONE 'UTC'::text) AT TIME ZONE 'Asia/Ho_Chi_Minh'::text) AS real_created_at_7_utc,
    ((ho.created_at AT TIME ZONE 'UTC'::text) AT TIME ZONE 'Asia/Ho_Chi_Minh'::text) AS hrv_created_at,
    ho.order_number,
    ho.billing_address_country,
    ho.billing_address_province,
    ho.billing_address_district,
    ho.billing_address_ward,
    ho.cancel_reason,
    ((ho.cancelled_at AT TIME ZONE 'UTC'::text) AT TIME ZONE 'Asia/Ho_Chi_Minh'::text) AS hrv_cancelled_at,
    ho.customer_id AS hrv_customer_id,
    ho.customer_birthday,
    EXTRACT(year FROM age(((ho.customer_birthday)::date)::timestamp with time zone)) AS customer_age,
    ho.customer_email AS hrv_customer_email,
    ho.customer_phone AS hrv_customer_phone,
    concat(ho.customer_last_name, ' ', ho.customer_first_name) AS hrv_customer_name,
    ho.financial_status,
    ho.fulfillment_status,
    ho.tags,
    ho.gateway,
    ho.landing_site,
    ho.source,
    ho.shipping_address_country,
    ho.shipping_address_province,
    ho.shipping_address_district,
    ho.shipping_address_ward,
    ho.shipping_address_name,
    ho.subtotal_price,
    ho.total_price,
    ho.total_discounts,
    ho.total_line_items_price,
    ho.total_tax,
    ho.closed_status,
    ho.cancelled_status,
    ho.confirmed_status,
    ho.assigned_location_id,
    ho.assigned_location_name,
    ho.user_id AS hrv_user_id,
    ho.location_id,
    ho.location_name,
    ho.confirm_user AS hrv_confirm_user,
    eso.name AS sales_orders_name,
    eso.delivery_date,
    ((eso.expected_delivery_date AT TIME ZONE 'UTC'::text) AT TIME ZONE 'Asia/Ho_Chi_Minh'::text) AS expected_delivery_date,
    ((eso.expected_payment_date AT TIME ZONE 'UTC'::text) AT TIME ZONE 'Asia/Ho_Chi_Minh'::text) AS expected_payment_date,
    eso.cost_center,
    eso.paid_amount,
    (eso.sales_team IS NOT NULL) AS is_divided,
    eso.customer_type,
    eso.customer_group,
    eso.apply_discount_on,
    eso.billing_status,
    eso.coupon_code,
    eso.total_qty,
    eso.territory,
    eso.source AS sales_order_source,
    eso.consultation_date,
    eso.primary_sales_person,
    spv.sales_person_name AS main_sales_person_name,
    spv.city AS main_city,
    spv.branch AS main_branch,
    spv."position" AS main_position,
    ec.name AS erp_customer_name,
    ec.birth_date,
    ec.gender,
    ec.person_name,
    ec.first_source,
    els.source_name AS first_channel,
    els.pancake_platform AS first_platform,
    ec.customer_website,
    ec.customer_journey,
    ec.phone AS customer_phone,
    ec.rank,
    ec.customer_rank,
    ((ec.priority_login_date AT TIME ZONE 'UTC'::text) AT TIME ZONE 'Asia/Ho_Chi_Minh'::text) AS priority_login_date,
    ec.default_sales_partner,
    ec.tax_category,
    ec.lead_name,
    el.lead_source_name,
    purpose.purchase_purpose_labels
   FROM ((((((haravan.orders ho
     LEFT JOIN erpnext.sales_orders eso ON ((((ho.id)::character varying)::text = eso.haravan_order_id)))
     LEFT JOIN erpnext.customers ec ON ((eso.customer = (ec.name)::text)))
     LEFT JOIN erpnext.lead_sources els ON (((els.name)::text = (ec.first_source)::text)))
     LEFT JOIN erpnext.leads el ON (((ec.lead_name)::text = (el.name)::text)))
     LEFT JOIN reporting.sales_person_view spv ON ((eso.primary_sales_person = spv.name)))
     LEFT JOIN ( SELECT so.name,
            string_agg((pl.title)::text, ' & '::text) AS purchase_purpose_labels
           FROM ((erpnext.sales_orders so
             CROSS JOIN LATERAL jsonb_array_elements(so.sales_order_purposes) purpose_elements(value))
             LEFT JOIN erpnext.purchase_purposes pl ON (((pl.name)::text = (purpose_elements.value ->> 'purchase_purpose'::text))))
          GROUP BY so.name) purpose ON ((eso.name = purpose.name)))
  WITH NO DATA;


--
-- Name: order_line_item_dim; Type: MATERIALIZED VIEW; Schema: reporting; Owner: -
--

CREATE MATERIALIZED VIEW reporting.order_line_item_dim AS
 SELECT sales_order_dim.id,
    sales_order_dim.real_created_at_7_utc,
    sales_order_dim.hrv_created_at,
    sales_order_dim.order_number,
    sales_order_dim.billing_address_country,
    sales_order_dim.billing_address_province,
    sales_order_dim.billing_address_district,
    sales_order_dim.billing_address_ward,
    sales_order_dim.cancel_reason,
    sales_order_dim.hrv_cancelled_at,
    sales_order_dim.hrv_customer_id,
    sales_order_dim.customer_birthday,
    sales_order_dim.customer_age,
    sales_order_dim.hrv_customer_email,
    sales_order_dim.hrv_customer_phone,
    sales_order_dim.hrv_customer_name,
    sales_order_dim.financial_status,
    sales_order_dim.fulfillment_status,
    sales_order_dim.tags,
    sales_order_dim.gateway,
    sales_order_dim.landing_site,
    sales_order_dim.source,
    sales_order_dim.shipping_address_country,
    sales_order_dim.shipping_address_province,
    sales_order_dim.shipping_address_district,
    sales_order_dim.shipping_address_ward,
    sales_order_dim.shipping_address_name,
    sales_order_dim.subtotal_price,
    sales_order_dim.total_price,
    sales_order_dim.total_discounts,
    sales_order_dim.total_line_items_price,
    sales_order_dim.total_tax,
    sales_order_dim.closed_status,
    sales_order_dim.cancelled_status,
    sales_order_dim.confirmed_status,
    sales_order_dim.assigned_location_id,
    sales_order_dim.assigned_location_name,
    sales_order_dim.hrv_user_id,
    sales_order_dim.location_id,
    sales_order_dim.location_name,
    sales_order_dim.hrv_confirm_user,
    sales_order_dim.sales_orders_name,
    sales_order_dim.delivery_date,
    sales_order_dim.expected_delivery_date,
    sales_order_dim.expected_payment_date,
    sales_order_dim.cost_center,
    sales_order_dim.paid_amount,
    sales_order_dim.is_divided,
    sales_order_dim.customer_type,
    sales_order_dim.customer_group,
    sales_order_dim.apply_discount_on,
    sales_order_dim.billing_status,
    sales_order_dim.coupon_code,
    sales_order_dim.total_qty,
    sales_order_dim.territory,
    sales_order_dim.sales_order_source,
    sales_order_dim.consultation_date,
    sales_order_dim.primary_sales_person,
    sales_order_dim.main_sales_person_name,
    sales_order_dim.main_city,
    sales_order_dim.main_branch,
    sales_order_dim.main_position,
    sales_order_dim.erp_customer_name,
    sales_order_dim.birth_date,
    sales_order_dim.gender,
    sales_order_dim.person_name,
    sales_order_dim.first_source,
    sales_order_dim.first_channel,
    sales_order_dim.first_platform,
    sales_order_dim.customer_website,
    sales_order_dim.customer_journey,
    sales_order_dim.customer_phone,
    sales_order_dim.rank,
    sales_order_dim.customer_rank,
    sales_order_dim.priority_login_date,
    sales_order_dim.default_sales_partner,
    sales_order_dim.tax_category,
    sales_order_dim.lead_name,
    sales_order_dim.lead_source_name,
    sales_order_dim.purchase_purpose_labels,
    line_item_view.line_item_id,
    line_item_view.order_id,
    line_item_view.fulfillment_service,
    line_item_view.line_item_fulfillment_status,
    line_item_view.price,
    line_item_view.price_original,
    line_item_view.price_promotion,
    line_item_view.quantity,
    line_item_view.product_id,
    line_item_view.sku,
    line_item_view.title,
    line_item_view.variant_id,
    line_item_view.variant_title,
    line_item_view.vendor,
    line_item_view.type,
    line_item_view.barcode,
    line_item_view.total_discount,
    line_item_view.report_lab,
    line_item_view.report_no,
    line_item_view.diamond_shape,
    line_item_view.diamond_cut,
    line_item_view.diamond_color,
    line_item_view.diamond_clarity,
    line_item_view.diamond_fluorescence,
    line_item_view.diamond_edge_size_1,
    line_item_view.diamond_edge_size_2,
    line_item_view.diamond_carat,
    line_item_view.jewelrie_category,
    line_item_view.jewelrie_applique_material,
    line_item_view.jewelrie_fineness,
    line_item_view.jewelrie_material_color,
    line_item_view.jewelrie_size_type,
    line_item_view.jewelrie_ring_size,
    line_item_view.design_code,
    line_item_view.code,
    line_item_view.erp_code,
    line_item_view.design_type,
    line_item_view.design_gender,
    line_item_view.design_year,
    line_item_view.diamond_holder,
    line_item_view.design_source,
    line_item_view.design_pick_up,
    line_item_view.design_created_at,
    line_item_view.ring_band_type,
    line_item_view.ring_band_style,
    line_item_view.ring_head_style,
    line_item_view.jewelry_rd_style,
    line_item_view.product_line,
    line_item_view.product_availability_status,
    line_item_view.test_name,
    line_item_view.design_image
   FROM (reporting.sales_order_dim
     LEFT JOIN reporting.line_item_view ON ((sales_order_dim.id = line_item_view.order_id)))
  WITH NO DATA;


--
-- Name: order_promotion_view; Type: MATERIALIZED VIEW; Schema: reporting; Owner: -
--

CREATE MATERIALIZED VIEW reporting.order_promotion_view AS
 SELECT eso.name,
    eso.haravan_order_id,
    eso.order_number,
    eso.source,
    eso.source_name,
    eso.cancelled_status,
    eso.financial_status,
    eso.fulfillment_status,
    eso.expected_delivery_date,
    eso.customer_type,
    COALESCE(eso.real_order_date, eso.creation) AS real_created_at,
    eso.creation AS order_created_on,
    eso.modified AS updated_at,
    eso.grand_total AS tong_tien_hang,
    eso.total,
    eso.customer,
    (promotion.value ->> 'promotion'::text) AS promotion_id,
        CASE
            WHEN ((ep.scope)::text = 'Order'::text) THEN 'Đơn hàng'::text
            WHEN ((ep.scope)::text = 'Line Item'::text) THEN 'Sản phẩm'::text
            ELSE ''::text
        END AS promotion_scope_label,
    ep.title AS promotion_description_value,
    ''::text AS discount_group_label,
    ep.discount_percent AS discount_percentage,
    ep.discount_amount,
    ''::text AS promotion_name,
    ''::text AS type_of_promotion_value,
    (regexp_replace((ep.priority)::text, '[^0-9]'::text, ''::text, 'g'::text))::integer AS priority,
    ''::text AS discount_duration_label,
    row_number() OVER (PARTITION BY eso.name, (promotion.value ->> '_id'::text) ORDER BY (regexp_replace((ep.priority)::text, '[^0-9]'::text, ''::text, 'g'::text))::integer, ep.discount_percent DESC, ep.discount_amount DESC) AS promotion_priority
   FROM ((erpnext.sales_orders eso
     LEFT JOIN LATERAL jsonb_array_elements(eso.promotions) promotion(value) ON (true))
     LEFT JOIN erpnext.promotions ep ON (((ep.name)::text = (promotion.value ->> 'promotion'::text))))
  WITH NO DATA;


--
-- Name: sales_team_view; Type: MATERIALIZED VIEW; Schema: reporting; Owner: -
--

CREATE MATERIALIZED VIEW reporting.sales_team_view AS
 SELECT eso.name,
    eso.haravan_order_id,
    spv.sales_person_name,
    spv.region_name,
    (sales_elements.value ->> 'sales_person'::text) AS sales_person,
    ((sales_elements.value ->> 'allocated_amount'::text))::numeric(36,8) AS allocated_amount,
    ((sales_elements.value ->> 'allocated_percentage'::text))::double precision AS allocated_percentage,
    spv.city,
    spv.branch,
    spv."position",
    spv.status AS sales_status
   FROM erpnext.sales_orders eso,
    (LATERAL jsonb_array_elements(eso.sales_team) sales_elements(value)
     LEFT JOIN reporting.sales_person_view spv ON ((spv.name = (sales_elements.value ->> 'sales_person'::text))))
  WITH NO DATA;


--
-- Name: order_sales_team_dim; Type: MATERIALIZED VIEW; Schema: reporting; Owner: -
--

CREATE MATERIALIZED VIEW reporting.order_sales_team_dim AS
 SELECT sod.id,
    sod.real_created_at_7_utc,
    sod.hrv_created_at,
    sod.order_number,
    sod.billing_address_country,
    sod.billing_address_province,
    sod.billing_address_district,
    sod.billing_address_ward,
    sod.cancel_reason,
    sod.hrv_cancelled_at,
    sod.hrv_customer_id,
    sod.customer_birthday,
    sod.customer_age,
    sod.hrv_customer_email,
    sod.hrv_customer_phone,
    sod.hrv_customer_name,
    sod.financial_status,
    sod.fulfillment_status,
    sod.tags,
    sod.gateway,
    sod.landing_site,
    sod.source,
    sod.shipping_address_country,
    sod.shipping_address_province,
    sod.shipping_address_district,
    sod.shipping_address_ward,
    sod.shipping_address_name,
    sod.subtotal_price,
    sod.total_price,
    sod.total_discounts,
    sod.total_line_items_price,
    sod.total_tax,
    sod.closed_status,
    sod.cancelled_status,
    sod.confirmed_status,
    sod.assigned_location_id,
    sod.assigned_location_name,
    sod.hrv_user_id,
    sod.location_id,
    sod.location_name,
    sod.hrv_confirm_user,
    sod.sales_orders_name,
    sod.delivery_date,
    sod.expected_delivery_date,
    sod.expected_payment_date,
    sod.cost_center,
    sod.paid_amount,
    sod.is_divided,
    sod.customer_type,
    sod.customer_group,
    sod.apply_discount_on,
    sod.billing_status,
    sod.coupon_code,
    sod.total_qty,
    sod.territory,
    sod.sales_order_source,
    sod.consultation_date,
    sod.primary_sales_person,
    sod.main_sales_person_name,
    sod.main_city,
    sod.main_branch,
    sod.main_position,
    sod.erp_customer_name,
    sod.birth_date,
    sod.gender,
    sod.person_name,
    sod.first_source,
    sod.first_channel,
    sod.first_platform,
    sod.customer_website,
    sod.customer_journey,
    sod.customer_phone,
    sod.rank,
    sod.customer_rank,
    sod.priority_login_date,
    sod.default_sales_partner,
    sod.tax_category,
    sod.lead_name,
    sod.lead_source_name,
    sod.purchase_purpose_labels,
    stv.name,
    stv.haravan_order_id,
    stv.sales_person_name,
    stv.region_name,
    stv.sales_person,
    stv.allocated_amount,
    stv.allocated_percentage,
    stv.city,
    stv.branch,
    stv."position",
    stv.sales_status
   FROM (reporting.sales_order_dim sod
     LEFT JOIN reporting.sales_team_view stv ON (((sod.id)::text = stv.haravan_order_id)))
  WITH NO DATA;


--
-- Name: product_warehouse_stock_view; Type: MATERIALIZED VIEW; Schema: reporting; Owner: -
--

CREATE MATERIALIZED VIEW reporting.product_warehouse_stock_view AS
 SELECT hv.id AS variant_id,
    hv.product_id,
    hv.published_scope,
    hv.product_type AS haravan_product_type,
    hv.product_title,
    hv.barcode,
    hv.sku,
    hv.price,
    hv.title AS variant_title,
    hv.qty_onhand,
    hv.qty_commited,
    hv.qty_available,
    hv.qty_incoming,
    hv.created_at,
    hv.updated_at,
    wdi.id AS noco_diamond_id,
    wdi.report_lab,
    wdi.shape AS diamond_shape,
    wdi.cut AS diamond_cut,
    wdi.color AS diamond_color,
    wdi.clarity AS diamond_clarity,
    wdi.fluorescence AS diamond_fluorescence,
    wdi.edge_size_1 AS diamond_edge_size_1,
    wdi.edge_size_2 AS diamond_edge_size_2,
    wdi.carat AS diamond_carat,
    wv.id AS noco_variant_id,
    wv.category AS jewelrie_category,
    wv.applique_material AS jewelrie_applique_material,
    wv.fineness AS jewelrie_fineness,
    wv.material_color AS jewelrie_material_color,
    wv.size_type AS jewelrie_size_type,
    wv.ring_size AS jewelrie_ring_size,
    inventory.name AS location_name,
    inventory.qty_onhand AS stock_qty_onhand,
    inventory.qty_available AS stock_qty_available,
    inventory.qty_committed AS stock_qty_committed,
    inventory.qty_incoming AS stock_qty_incoming,
    wv.haravan_product_id,
    wd.design_code,
    wd.code,
    wd.erp_code,
    wd.ring_band_type,
    wd.ring_head_style,
    wd.jewelry_rd_style,
    wd.shape_of_main_stone,
    wd.product_line,
    wd.main_stone AS design_main_tone,
    hi.src
   FROM ((((((haravan.variants hv
     LEFT JOIN workplace.diamonds wdi ON ((hv.id = wdi.variant_id)))
     LEFT JOIN workplace.variants wv ON ((hv.id = wv.haravan_variant_id)))
     LEFT JOIN workplace.products wp ON ((wv.product_id = wp.id)))
     LEFT JOIN workplace.designs wd ON ((wd.id = wp.design_id)))
     LEFT JOIN LATERAL ( SELECT images.src
           FROM haravan.images
          WHERE (images.product_id = hv.product_id)
         LIMIT 1) hi ON (true))
     JOIN ( SELECT hwi.uuid,
            hwi.id,
            hwi.loc_id,
            hwi.product_id,
            hwi.variant_id,
            hwi.qty_onhand,
            hwi.qty_committed,
            hwi.qty_available,
            hwi.qty_incoming,
            hwi.updated_at,
            hwi.database_created_at,
            hwi.database_updated_at,
            hw.id,
            hw.name
           FROM (haravan.warehouse_inventories hwi
             LEFT JOIN haravan.warehouses hw ON ((hwi.loc_id = hw.id)))
          WHERE ((hwi.qty_onhand <> 0) OR (hwi.qty_committed <> 0) OR (hwi.qty_incoming <> 0) OR (hwi.qty_available <> 0))) inventory(uuid, id, loc_id, product_id, variant_id, qty_onhand, qty_committed, qty_available, qty_incoming, updated_at, database_created_at, database_updated_at, id_1, name) ON ((hv.id = inventory.variant_id)))
  WHERE ((hv.qty_onhand <> 0) OR (hv.qty_commited <> 0) OR (hv.qty_incoming <> 0) OR (hv.qty_available <> 0))
  WITH NO DATA;


--
-- Name: serial_temp_view; Type: MATERIALIZED VIEW; Schema: reporting; Owner: -
--

CREATE MATERIALIZED VIEW reporting.serial_temp_view AS
 SELECT serials.id,
    serials.order_code,
    serials.sku,
    serials.item_id,
    serials.item_code,
    serials.barcode,
    serials.serials,
    hv.ref_order_number,
    hv.cancelled_status
   FROM (( SELECT bo.id,
            bo.order_code,
            (item.value ->> 'sku'::text) AS sku,
            (item.value ->> 'variant_id'::text) AS item_id,
            (item.value ->> 'item_code'::text) AS item_code,
            (item.value ->> 'barcode'::text) AS barcode,
            string_agg((bcn.serial_number)::text, '
'::text) AS serials
           FROM (((bizflycrm.orders bo
             CROSS JOIN LATERAL jsonb_array_elements(
                CASE jsonb_typeof(bo.order_data_item)
                    WHEN 'array'::text THEN bo.order_data_item
                    ELSE '[{"order_data_items": null}]'::jsonb
                END) item(value))
             LEFT JOIN LATERAL ( SELECT jsonb_array_elements(tmp.sn_arr) AS serial_number_elem
                   FROM ( SELECT
                                CASE
                                    WHEN (jsonb_typeof((item.value -> 'serial_number'::text)) = 'array'::text) THEN (item.value -> 'serial_number'::text)
                                    ELSE '[]'::jsonb
                                END AS sn_arr) tmp) sn ON (true))
             LEFT JOIN bizflycrm.serial_numbers bcn ON (((bcn.id)::text = (sn.serial_number_elem ->> 'id'::text))))
          GROUP BY bo.id, bo.order_code, (item.value ->> 'sku'::text), (item.value ->> 'variant_id'::text), (item.value ->> 'item_code'::text), (item.value ->> 'barcode'::text)) serials
     LEFT JOIN haravan.orders hv ON (((hv.name)::text = (serials.order_code)::text)))
  WITH NO DATA;


--
-- Name: time_dim; Type: TABLE; Schema: reporting; Owner: -
--

CREATE TABLE reporting.time_dim (
    col integer NOT NULL,
    day timestamp without time zone
);


--
-- Name: time_dim_col_seq; Type: SEQUENCE; Schema: reporting; Owner: -
--

CREATE SEQUENCE reporting.time_dim_col_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: time_dim_col_seq; Type: SEQUENCE OWNED BY; Schema: reporting; Owner: -
--

ALTER SEQUENCE reporting.time_dim_col_seq OWNED BY reporting.time_dim.col;


--
-- Name: conversation_embeddings; Type: TABLE; Schema: salesaya; Owner: -
--

CREATE TABLE salesaya.conversation_embeddings (
    id bigint NOT NULL,
    conversation_id text,
    document text,
    last_encoded_string text,
    database_updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    database_created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    embedding salesaya.vector
);


--
-- Name: conversation_embeddings_id_seq; Type: SEQUENCE; Schema: salesaya; Owner: -
--

CREATE SEQUENCE salesaya.conversation_embeddings_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: conversation_embeddings_id_seq; Type: SEQUENCE OWNED BY; Schema: salesaya; Owner: -
--

ALTER SEQUENCE salesaya.conversation_embeddings_id_seq OWNED BY salesaya.conversation_embeddings.id;


--
-- Name: conversations; Type: TABLE; Schema: salesaya; Owner: -
--

CREATE TABLE salesaya.conversations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    pancake_conversation_id character varying NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: customer_info; Type: TABLE; Schema: salesaya; Owner: -
--

CREATE TABLE salesaya.customer_info (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    pancake_customer_id character varying(255),
    pancake_conversation_id character varying NOT NULL,
    full_name character varying,
    phones jsonb,
    address_line character varying,
    notes character varying,
    gender text,
    email character varying,
    city_name character varying,
    district_name character varying,
    country_name character varying,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    lead_status character varying DEFAULT ''::character varying,
    ai_summary character varying,
    source character varying(255),
    sale character varying(255),
    tags json,
    bizflycrm_customer_id character varying(255),
    CONSTRAINT gender_check CHECK ((gender = ANY (ARRAY['male'::text, 'female'::text, 'other'::text]))),
    CONSTRAINT lead_status_check CHECK (((lead_status)::text = ANY (ARRAY['lead'::text, 'potential'::text, 'opportunity'::text, 'quote'::text, ''::text])))
);


--
-- Name: diamond_clarities; Type: TABLE; Schema: salesaya; Owner: -
--

CREATE TABLE salesaya.diamond_clarities (
    id integer NOT NULL,
    grade character varying NOT NULL,
    is_active boolean DEFAULT true
);


--
-- Name: diamond_clarities_id_seq; Type: SEQUENCE; Schema: salesaya; Owner: -
--

CREATE SEQUENCE salesaya.diamond_clarities_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: diamond_clarities_id_seq; Type: SEQUENCE OWNED BY; Schema: salesaya; Owner: -
--

ALTER SEQUENCE salesaya.diamond_clarities_id_seq OWNED BY salesaya.diamond_clarities.id;


--
-- Name: diamond_colors; Type: TABLE; Schema: salesaya; Owner: -
--

CREATE TABLE salesaya.diamond_colors (
    id integer NOT NULL,
    grade character varying NOT NULL,
    is_active boolean DEFAULT true
);


--
-- Name: diamond_colors_id_seq; Type: SEQUENCE; Schema: salesaya; Owner: -
--

CREATE SEQUENCE salesaya.diamond_colors_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: diamond_colors_id_seq; Type: SEQUENCE OWNED BY; Schema: salesaya; Owner: -
--

ALTER SEQUENCE salesaya.diamond_colors_id_seq OWNED BY salesaya.diamond_colors.id;


--
-- Name: diamond_shapes; Type: TABLE; Schema: salesaya; Owner: -
--

CREATE TABLE salesaya.diamond_shapes (
    id integer NOT NULL,
    name character varying NOT NULL,
    is_active boolean DEFAULT true
);


--
-- Name: diamond_shapes_id_seq; Type: SEQUENCE; Schema: salesaya; Owner: -
--

CREATE SEQUENCE salesaya.diamond_shapes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: diamond_shapes_id_seq; Type: SEQUENCE OWNED BY; Schema: salesaya; Owner: -
--

ALTER SEQUENCE salesaya.diamond_shapes_id_seq OWNED BY salesaya.diamond_shapes.id;


--
-- Name: diamond_sizes; Type: TABLE; Schema: salesaya; Owner: -
--

CREATE TABLE salesaya.diamond_sizes (
    id integer NOT NULL,
    size character varying NOT NULL,
    is_active boolean DEFAULT true
);


--
-- Name: diamond_sizes_id_seq; Type: SEQUENCE; Schema: salesaya; Owner: -
--

CREATE SEQUENCE salesaya.diamond_sizes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: diamond_sizes_id_seq; Type: SEQUENCE OWNED BY; Schema: salesaya; Owner: -
--

ALTER SEQUENCE salesaya.diamond_sizes_id_seq OWNED BY salesaya.diamond_sizes.id;


--
-- Name: embeddings; Type: TABLE; Schema: salesaya; Owner: -
--

CREATE TABLE salesaya.embeddings (
    id bigint NOT NULL,
    document text,
    embedding salesaya.vector(1536),
    situation text,
    keywords text,
    conversation_stage text,
    relavant_needs text,
    last_encoded_string text,
    database_updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    database_created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: embeddings_id_seq; Type: SEQUENCE; Schema: salesaya; Owner: -
--

CREATE SEQUENCE salesaya.embeddings_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: embeddings_id_seq; Type: SEQUENCE OWNED BY; Schema: salesaya; Owner: -
--

ALTER SEQUENCE salesaya.embeddings_id_seq OWNED BY salesaya.embeddings.id;


--
-- Name: gold_types; Type: TABLE; Schema: salesaya; Owner: -
--

CREATE TABLE salesaya.gold_types (
    id integer NOT NULL,
    name character varying NOT NULL,
    is_active boolean DEFAULT true
);


--
-- Name: gold_types_id_seq; Type: SEQUENCE; Schema: salesaya; Owner: -
--

CREATE SEQUENCE salesaya.gold_types_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: gold_types_id_seq; Type: SEQUENCE OWNED BY; Schema: salesaya; Owner: -
--

ALTER SEQUENCE salesaya.gold_types_id_seq OWNED BY salesaya.gold_types.id;


--
-- Name: items; Type: TABLE; Schema: salesaya; Owner: -
--

CREATE TABLE salesaya.items (
    id bigint NOT NULL,
    embedding salesaya.vector(3)
);


--
-- Name: items_id_seq; Type: SEQUENCE; Schema: salesaya; Owner: -
--

CREATE SEQUENCE salesaya.items_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: items_id_seq; Type: SEQUENCE OWNED BY; Schema: salesaya; Owner: -
--

ALTER SEQUENCE salesaya.items_id_seq OWNED BY salesaya.items.id;


--
-- Name: jewelry_categories; Type: TABLE; Schema: salesaya; Owner: -
--

CREATE TABLE salesaya.jewelry_categories (
    id integer NOT NULL,
    name character varying NOT NULL,
    is_active boolean DEFAULT true
);


--
-- Name: jewelry_details; Type: TABLE; Schema: salesaya; Owner: -
--

CREATE TABLE salesaya.jewelry_details (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    opportunity_id uuid NOT NULL,
    need_id integer,
    jewelry_price numeric(36,8),
    jewelry_type_id integer,
    gold_type_id integer,
    material_id integer,
    diamond_shape_id integer,
    diamond_size_id integer,
    diamond_color_id integer,
    diamond_clarity_id integer,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    jewelry_categories_id integer
);


--
-- Name: jewelry_needs; Type: TABLE; Schema: salesaya; Owner: -
--

CREATE TABLE salesaya.jewelry_needs (
    id integer NOT NULL,
    name character varying NOT NULL,
    is_active boolean DEFAULT true
);


--
-- Name: jewelry_needs_id_seq; Type: SEQUENCE; Schema: salesaya; Owner: -
--

CREATE SEQUENCE salesaya.jewelry_needs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: jewelry_needs_id_seq; Type: SEQUENCE OWNED BY; Schema: salesaya; Owner: -
--

ALTER SEQUENCE salesaya.jewelry_needs_id_seq OWNED BY salesaya.jewelry_needs.id;


--
-- Name: jewelry_types; Type: TABLE; Schema: salesaya; Owner: -
--

CREATE TABLE salesaya.jewelry_types (
    id integer NOT NULL,
    name character varying NOT NULL,
    is_active boolean DEFAULT true
);


--
-- Name: jewelry_types_id_seq; Type: SEQUENCE; Schema: salesaya; Owner: -
--

CREATE SEQUENCE salesaya.jewelry_types_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: jewelry_types_id_seq; Type: SEQUENCE OWNED BY; Schema: salesaya; Owner: -
--

ALTER SEQUENCE salesaya.jewelry_types_id_seq OWNED BY salesaya.jewelry_categories.id;


--
-- Name: jewelry_types_id_seq1; Type: SEQUENCE; Schema: salesaya; Owner: -
--

CREATE SEQUENCE salesaya.jewelry_types_id_seq1
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: jewelry_types_id_seq1; Type: SEQUENCE OWNED BY; Schema: salesaya; Owner: -
--

ALTER SEQUENCE salesaya.jewelry_types_id_seq1 OWNED BY salesaya.jewelry_types.id;


--
-- Name: materials; Type: TABLE; Schema: salesaya; Owner: -
--

CREATE TABLE salesaya.materials (
    id integer NOT NULL,
    name character varying NOT NULL,
    is_active boolean DEFAULT true
);


--
-- Name: materials_id_seq; Type: SEQUENCE; Schema: salesaya; Owner: -
--

CREATE SEQUENCE salesaya.materials_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: materials_id_seq; Type: SEQUENCE OWNED BY; Schema: salesaya; Owner: -
--

ALTER SEQUENCE salesaya.materials_id_seq OWNED BY salesaya.materials.id;


--
-- Name: messages; Type: TABLE; Schema: salesaya; Owner: -
--

CREATE TABLE salesaya.messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    conversation_id uuid NOT NULL,
    pancake_conversation_id character varying NOT NULL,
    sender_role character varying NOT NULL,
    content jsonb NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at character varying DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: opportunities; Type: TABLE; Schema: salesaya; Owner: -
--

CREATE TABLE salesaya.opportunities (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    status character varying DEFAULT 'open'::character varying NOT NULL,
    probability integer,
    expected_close_date date,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    pancake_conversation_id character varying,
    CONSTRAINT status_check CHECK (((status)::text = ANY ((ARRAY['open'::character varying, 'won'::character varying, 'lost'::character varying, 'on_hold'::character varying])::text[])))
);


--
-- Name: products; Type: TABLE; Schema: salesaya; Owner: -
--

CREATE TABLE salesaya.products (
    product_id integer,
    product_type character varying,
    web_url text,
    price numeric(36,8),
    images character varying[]
);


--
-- Name: buyback_exchange_approval_instances_detail; Type: TABLE; Schema: supplychain; Owner: -
--

CREATE TABLE supplychain.buyback_exchange_approval_instances_detail (
    request_no text NOT NULL,
    status text,
    approval_process text,
    completed_at timestamp without time zone,
    initiator_department text,
    current_assignee text,
    approval_steps text,
    request_type text,
    customer_code text,
    receiving_processing_location text,
    customer_handover_datetime timestamp without time zone,
    source_id text,
    total_transfer_amount numeric(18,2),
    transfer_information text,
    non_invoice_purchase_list text,
    goods_inspection_certificate text,
    other_attachments text,
    other_information text,
    updated_at timestamp without time zone,
    requester_email text,
    requester_en_name text,
    requester_id text,
    requester_name text,
    record_id text
);


--
-- Name: capture_variants; Type: TABLE; Schema: supplychain; Owner: -
--

CREATE TABLE supplychain.capture_variants (
    nocodb_variant_id integer NOT NULL,
    nocodb_product_id integer,
    barcode text,
    published_scope text,
    price numeric,
    capture_date timestamp without time zone DEFAULT now()
);


--
-- Name: design_melee; Type: TABLE; Schema: supplychain; Owner: -
--

CREATE TABLE supplychain.design_melee (
    id integer NOT NULL,
    design_id integer NOT NULL,
    shape text,
    length numeric,
    width numeric,
    melee_number integer,
    database_created_at timestamp without time zone DEFAULT now(),
    database_updated_at timestamp without time zone
);


--
-- Name: design_melee_id_seq; Type: SEQUENCE; Schema: supplychain; Owner: -
--

CREATE SEQUENCE supplychain.design_melee_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: design_melee_id_seq; Type: SEQUENCE OWNED BY; Schema: supplychain; Owner: -
--

ALTER SEQUENCE supplychain.design_melee_id_seq OWNED BY supplychain.design_melee.id;


--
-- Name: designs; Type: TABLE; Schema: supplychain; Owner: -
--

CREATE TABLE supplychain.designs (
    id integer NOT NULL,
    code text,
    erp_code text,
    backup_code text,
    design_type text,
    gender text,
    design_year text,
    design_seq bigint,
    usage_status text,
    link_4view text,
    folder_summary text,
    link_3d text,
    link_render text,
    link_retouch text,
    ring_band_type text,
    ring_band_style text,
    ring_head_style text,
    jewelry_rd_style text,
    shape_of_main_stone text,
    product_line text,
    social_post boolean,
    website boolean,
    "RENDER" boolean,
    "RETOUCH" boolean,
    gold_weight numeric,
    main_stone text,
    stone_quantity text,
    stone_weight text,
    diamond_holder text,
    source text,
    variant_number bigint,
    collections_id integer,
    image_4view text,
    image_render text,
    image_retouch text,
    created_by character varying,
    updated_by character varying,
    database_created_at timestamp without time zone,
    database_updated_at timestamp without time zone,
    collection_name text,
    auto_create_folder boolean,
    design_code text,
    ecom_showed boolean,
    tag text,
    stock_locations text,
    wedding_ring_id integer,
    reference_code text,
    design_status text,
    erp_code_duplicated boolean,
    max_seq integer,
    last_synced_render text,
    last_synced_4view text,
    melee_type text,
    database_updated_link_4view_at timestamp without time zone,
    get_melee_status text DEFAULT 'Pending'::text,
    four_view_status boolean,
    melee_type_update_at timestamp without time zone,
    is_create_auto_variant boolean DEFAULT false,
    CONSTRAINT designs_get_melee_status_check CHECK ((get_melee_status = ANY (ARRAY['Pending'::text, 'Success'::text, 'Fail'::text])))
);


--
-- Name: diamond_attribute; Type: TABLE; Schema: supplychain; Owner: -
--

CREATE TABLE supplychain.diamond_attribute (
    report_no text NOT NULL,
    report_type text,
    report_date text,
    shape text,
    measurements text,
    weight text,
    color_grade text,
    clarity_grade text,
    cut_grade text,
    depth text,
    "table" text,
    crown_angle text,
    crown_height text,
    pavilion_angle text,
    pavilion_depth text,
    star_length text,
    lower_half text,
    girdle text,
    culet text,
    polish text,
    symmetry text,
    fluorescence text,
    clarity_characteristics text,
    inscription text,
    encrypted_report_no text,
    simple_encrypted_report_no text,
    is_pdf_available boolean,
    pdf_url text,
    propimg text,
    digital_card text,
    database_created_at timestamp without time zone,
    database_updated_at timestamp without time zone
);


--
-- Name: diamond_available_inventory; Type: VIEW; Schema: supplychain; Owner: -
--

CREATE VIEW supplychain.diamond_available_inventory AS
 WITH inventory_n_location AS (
         SELECT warehouses.name AS warehouse_name,
            warehouse_inventories.variant_id
           FROM (haravan.warehouse_inventories
             LEFT JOIN haravan.warehouses ON ((warehouses.id = warehouse_inventories.loc_id)))
          WHERE (warehouse_inventories.qty_onhand <> 0)
        )
 SELECT inventory_n_location.warehouse_name,
    diamonds.id,
    diamonds.barcode,
    diamonds.report_lab,
    diamonds.report_no,
    diamonds.cogs,
    diamonds.product_group,
    diamonds.shape,
    diamonds.cut,
    diamonds.color,
    diamonds.clarity,
    diamonds.fluorescence,
    diamonds.edge_size_1,
    diamonds.edge_size_2,
    diamonds.carat,
    diamonds.auto_create_haravan_product,
    diamonds.product_id,
    diamonds.variant_id,
    diamonds.promotions,
    diamonds.link_haravan,
    variants.qty_onhand,
    variants.qty_available
   FROM ((workplace.diamonds
     LEFT JOIN haravan.variants ON ((variants.id = diamonds.variant_id)))
     LEFT JOIN inventory_n_location ON ((inventory_n_location.variant_id = diamonds.variant_id)))
  WHERE ((diamonds.variant_id IS NOT NULL) AND (variants.qty_available <> 0));


--
-- Name: diamond_purchase; Type: TABLE; Schema: supplychain; Owner: -
--

CREATE TABLE supplychain.diamond_purchase (
    report_no text NOT NULL,
    rapnet_price_usd numeric,
    rapnet_price_usd_source text,
    original_diamond_vnd_cost numeric,
    tax_cost_vnd numeric,
    delivery_cost_vnd numeric
);


--
-- Name: diamond_quotation_log; Type: TABLE; Schema: supplychain; Owner: -
--

CREATE TABLE supplychain.diamond_quotation_log (
    record_id text NOT NULL,
    ticket_record_id text,
    stage text,
    trandate timestamp with time zone,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


--
-- Name: diamond_ticket_quotation; Type: TABLE; Schema: supplychain; Owner: -
--

CREATE TABLE supplychain.diamond_ticket_quotation (
    id text NOT NULL,
    customer_name_hidden text,
    accountant text,
    customer_code text,
    description text,
    priority_level text,
    quotation_date timestamp without time zone,
    ticket_sent_at timestamp without time zone,
    sender text,
    sender_manager text,
    sender_system text,
    followers text,
    handler text,
    ticket_status text,
    exchange_rate numeric,
    attachment text,
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    rapnet_price numeric,
    rapnet_discount numeric,
    rapnet_price_per_carat numeric,
    text_status text,
    weight numeric,
    expected_profit_margin numeric,
    base_discount numeric,
    purchase_exchange_policy text,
    cut_quality text,
    final_price_for_sale numeric,
    cut text,
    fluorescence text,
    stone_size text,
    gia_code text,
    engraving_code text,
    polish_level text,
    gia_cert_issued_at date,
    color text,
    bonus text,
    clarity_characteristics text,
    clarity text,
    symmetry text,
    ticket_type text,
    expected_arrival_date timestamp without time zone,
    customer_phone_hidden text,
    order_code text,
    supplier_confirm_date timestamp without time zone,
    customer_appointment_date timestamp without time zone,
    expected_delivery_date timestamp without time zone,
    customer_phone_update text,
    customer_name_update text,
    desired_delivery_date timestamp without time zone,
    sale_note text,
    main_sale text,
    note text,
    record_id text NOT NULL
);


--
-- Name: melee_diamonds; Type: TABLE; Schema: workplace; Owner: -
--

CREATE TABLE workplace.melee_diamonds (
    id integer NOT NULL,
    haravan_product_id integer,
    haravan_variant_id integer,
    database_created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    database_updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    length numeric,
    width numeric,
    sku text,
    barcode text,
    shape text
);


--
-- Name: moissanite; Type: TABLE; Schema: workplace; Owner: -
--

CREATE TABLE workplace.moissanite (
    id integer NOT NULL,
    product_group text,
    shape text,
    length numeric,
    width numeric,
    color text,
    clarity text DEFAULT 'Không phân loại'::text,
    fluorescence text DEFAULT 'Không phân loại'::text,
    cut text DEFAULT 'Không phân loại'::text,
    polish text DEFAULT 'Không phân loại'::text,
    symmetry text DEFAULT 'Không phân loại'::text,
    haravan_product_id bigint,
    haravan_variant_id bigint,
    auto_create boolean DEFAULT false,
    price numeric DEFAULT 0,
    barcode text
);


--
-- Name: dim_products; Type: VIEW; Schema: supplychain; Owner: -
--

CREATE VIEW supplychain.dim_products AS
 WITH diamonds AS (
         SELECT d.product_id AS haravan_product_id,
            d.variant_id AS haravan_variant_id,
            d.barcode,
            d.report_no AS diamondreportno,
            d.price,
            d.cogs AS diamondcogs,
            d.product_group AS productgroup,
            d.shape AS diamondshape,
            d.cut AS diamondcut,
            COALESCE(NULLIF(d.color, ''::text), 'Khác'::text) AS diamondcolor,
            d.clarity AS diamondclarity,
            d.fluorescence AS diamondfluorescence,
            d.edge_size_1 AS diamondlength,
            d.edge_size_2 AS diamondwidth,
            d.carat AS diamondcarat
           FROM workplace.diamonds d
        ), jewelries AS (
         SELECT v.id AS jewelriesvariantid,
            p.design_id AS designid,
            p.haravan_product_id,
            v.haravan_variant_id,
            v.barcode,
            v.category AS productgroup,
            d.design_type AS jewelriesproducttype,
            d.gender AS jewelriesgender,
            v.applique_material AS jewelriesappliquematerial,
            v.fineness AS jewelriesfiness,
            v.material_color AS jewelriesmaterialcolor,
            v.size_type AS jewelriessizetype,
            v.ring_size AS jewelriesringsize,
            v.price
           FROM ((workplace.variants v
             LEFT JOIN workplace.products p ON ((v.product_id = p.id)))
             LEFT JOIN workplace.designs d ON ((d.id = p.design_id)))
          WHERE (v.haravan_variant_id IS NOT NULL)
        UNION ALL
         SELECT NULL::integer AS jewelriesvariantid,
            j.design_id AS designid,
            j.product_id AS haravan_product_id,
            j.variant_id AS haravan_variant_id,
            j.barcode,
            j.category AS productgroup,
            j.product_type AS jewelriesproducttype,
            j.gender AS jewelriesgender,
            j.applique_material AS jewelriesappliquematerial,
            j.fineness AS jewelriesfiness,
            j.material_color AS jewelriesmaterialcolor,
            j.size_type AS jewelriessizetype,
            j.ring_size AS jewelriesringsize,
            j.price
           FROM workplace.jewelries j
          WHERE (j.variant_id IS NOT NULL)
        ), haravan_product_types AS (
         SELECT variants.id AS haravan_variant_id,
            variants.product_type AS haravan_product_type
           FROM haravan.variants
        ), combined_data AS (
         SELECT diamonds.haravan_product_id,
            diamonds.haravan_variant_id,
            diamonds.barcode,
            diamonds.diamondreportno,
            diamonds.price,
            diamonds.diamondcogs,
            diamonds.productgroup,
            diamonds.diamondshape,
            diamonds.diamondcut,
            diamonds.diamondcolor,
            diamonds.diamondclarity,
            diamonds.diamondfluorescence,
            diamonds.diamondlength,
            diamonds.diamondwidth,
            diamonds.diamondcarat,
            NULL::integer AS jewelriesvariantid,
            NULL::bigint AS designid,
            NULL::text AS jewelriesproducttype,
            NULL::text AS jewelriesgender,
            NULL::text AS jewelriesappliquematerial,
            NULL::text AS jewelriesfiness,
            NULL::text AS jewelriesmaterialcolor,
            NULL::text AS jewelriessizetype,
            NULL::numeric AS jewelriesringsize,
            'diamond'::text AS source_table
           FROM diamonds
        UNION ALL
         SELECT jewelries.haravan_product_id,
            jewelries.haravan_variant_id,
            jewelries.barcode,
            NULL::bigint AS diamondreportno,
            jewelries.price,
            NULL::numeric AS diamondcogs,
            'Trang sức'::text AS productgroup,
            NULL::text AS diamondshape,
            NULL::text AS diamondcut,
            NULL::text AS diamondcolor,
            NULL::text AS diamondclarity,
            NULL::text AS diamondfluorescence,
            NULL::real AS diamondlength,
            NULL::real AS diamondwidth,
            NULL::numeric AS diamondcarat,
            jewelries.jewelriesvariantid,
            jewelries.designid,
            jewelries.jewelriesproducttype,
            jewelries.jewelriesgender,
            jewelries.jewelriesappliquematerial,
            jewelries.jewelriesfiness,
            jewelries.jewelriesmaterialcolor,
            jewelries.jewelriessizetype,
            jewelries.jewelriesringsize,
            'jewelry'::text AS source_table
           FROM jewelries
        UNION ALL
         SELECT variants.product_id AS haravan_product_id,
            variants.id AS haravan_variant_id,
            variants.barcode,
            NULL::bigint AS diamondreportno,
            variants.price,
            NULL::numeric AS diamondcogs,
            'Sản phẩm khác'::text AS productgroup,
            NULL::text AS diamondshape,
            NULL::text AS diamondcut,
            NULL::text AS diamondcolor,
            NULL::text AS diamondclarity,
            NULL::text AS diamondfluorescence,
            NULL::real AS diamondlength,
            NULL::real AS diamondwidth,
            NULL::numeric AS diamondcarat,
            NULL::integer AS jewelriesvariantid,
            NULL::bigint AS designid,
            NULL::text AS jewelriesproducttype,
            NULL::text AS jewelriesgender,
            NULL::text AS jewelriesappliquematerial,
            NULL::text AS jewelriesfiness,
            NULL::text AS jewelriesmaterialcolor,
            NULL::text AS jewelriessizetype,
            NULL::numeric AS jewelriesringsize,
            'variant'::text AS source_table
           FROM haravan.variants
          WHERE (((variants.product_type)::text = ANY ((ARRAY['virtual'::character varying, 'Hàng Bảo Hành'::character varying, 'Quà Tặng'::character varying, 'Hàng Khách Gửi'::character varying])::text[])) AND (((variants.product_type)::text = ANY ((ARRAY['virtual'::character varying, 'Hàng Khách Gửi'::character varying])::text[])) OR ((variants.title)::text !~ 'GIA[0-9]{10}'::text)))
        UNION ALL
         SELECT melee_diamonds.haravan_product_id,
            melee_diamonds.haravan_variant_id,
            melee_diamonds.barcode,
            NULL::bigint AS diamondreportno,
            NULL::numeric AS price,
            NULL::numeric AS diamondcogs,
            'Kim Cương Tấm'::text AS productgroup,
            melee_diamonds.shape AS diamondshape,
            NULL::text AS diamondcut,
            NULL::text AS diamondcolor,
            NULL::text AS diamondclarity,
            NULL::text AS diamondfluorescence,
            melee_diamonds.length AS diamondlength,
            melee_diamonds.width AS diamondwidth,
            NULL::numeric AS diamondcarat,
            NULL::integer AS jewelriesvariantid,
            NULL::bigint AS designid,
            NULL::text AS jewelriesproducttype,
            NULL::text AS jewelriesgender,
            NULL::text AS jewelriesappliquematerial,
            NULL::text AS jewelriesfiness,
            NULL::text AS jewelriesmaterialcolor,
            NULL::text AS jewelriessizetype,
            NULL::numeric AS jewelriesringsize,
            'melee_diamond'::text AS source_table
           FROM workplace.melee_diamonds
          WHERE (melee_diamonds.haravan_variant_id IS NOT NULL)
        UNION ALL
         SELECT moissanite.haravan_product_id,
            moissanite.haravan_variant_id,
            moissanite.barcode,
            NULL::bigint AS diamondreportno,
            NULL::numeric AS price,
            NULL::numeric AS diamondcogs,
            'Moissanite'::text AS productgroup,
            moissanite.shape AS diamondshape,
            NULL::text AS diamondcut,
            NULL::text AS diamondcolor,
            NULL::text AS diamondclarity,
            NULL::text AS diamondfluorescence,
            moissanite.length AS diamondlength,
            moissanite.width AS diamondwidth,
            NULL::numeric AS diamondcarat,
            NULL::integer AS jewelriesvariantid,
            NULL::bigint AS designid,
            NULL::text AS jewelriesproducttype,
            NULL::text AS jewelriesgender,
            NULL::text AS jewelriesappliquematerial,
            NULL::text AS jewelriesfiness,
            NULL::text AS jewelriesmaterialcolor,
            NULL::text AS jewelriessizetype,
            NULL::numeric AS jewelriesringsize,
            'moissanite'::text AS source_table
           FROM workplace.moissanite
          WHERE ((moissanite.haravan_variant_id IS NOT NULL) AND (moissanite.haravan_product_id IS NOT NULL))
        ), combined_with_product_type AS (
         SELECT cd.haravan_product_id,
            cd.haravan_variant_id,
            cd.barcode,
            cd.diamondreportno,
            cd.price,
            cd.diamondcogs,
            cd.productgroup,
            cd.diamondshape,
            cd.diamondcut,
            cd.diamondcolor,
            cd.diamondclarity,
            cd.diamondfluorescence,
            cd.diamondlength,
            cd.diamondwidth,
            cd.diamondcarat,
            cd.jewelriesvariantid,
            cd.designid,
            cd.jewelriesproducttype,
            cd.jewelriesgender,
            cd.jewelriesappliquematerial,
            cd.jewelriesfiness,
            cd.jewelriesmaterialcolor,
            cd.jewelriessizetype,
            cd.jewelriesringsize,
            cd.source_table,
            hpt.haravan_product_type
           FROM (combined_data cd
             LEFT JOIN haravan_product_types hpt ON ((cd.haravan_variant_id = hpt.haravan_variant_id)))
        ), ranked_data AS (
         SELECT combined_with_product_type.haravan_product_id,
            combined_with_product_type.haravan_variant_id,
            combined_with_product_type.barcode,
            combined_with_product_type.diamondreportno,
            combined_with_product_type.price,
            combined_with_product_type.diamondcogs,
            combined_with_product_type.productgroup,
            combined_with_product_type.diamondshape,
            combined_with_product_type.diamondcut,
            combined_with_product_type.diamondcolor,
            combined_with_product_type.diamondclarity,
            combined_with_product_type.diamondfluorescence,
            combined_with_product_type.diamondlength,
            combined_with_product_type.diamondwidth,
            combined_with_product_type.diamondcarat,
            combined_with_product_type.jewelriesvariantid,
            combined_with_product_type.designid,
            combined_with_product_type.jewelriesproducttype,
            combined_with_product_type.jewelriesgender,
            combined_with_product_type.jewelriesappliquematerial,
            combined_with_product_type.jewelriesfiness,
            combined_with_product_type.jewelriesmaterialcolor,
            combined_with_product_type.jewelriessizetype,
            combined_with_product_type.jewelriesringsize,
            combined_with_product_type.source_table,
            combined_with_product_type.haravan_product_type,
            row_number() OVER (PARTITION BY combined_with_product_type.haravan_variant_id ORDER BY combined_with_product_type.haravan_variant_id) AS rn
           FROM combined_with_product_type
        ), final_query AS (
         SELECT ranked_data.haravan_product_id,
            ranked_data.haravan_variant_id,
            ranked_data.barcode,
            ranked_data.diamondreportno,
            ranked_data.price,
            ranked_data.diamondcogs,
            ranked_data.productgroup,
            ranked_data.diamondshape,
            ranked_data.diamondcut,
            ranked_data.diamondcolor,
            ranked_data.diamondclarity,
            ranked_data.diamondfluorescence,
            ranked_data.diamondlength,
            ranked_data.diamondwidth,
            ranked_data.diamondcarat,
            ranked_data.jewelriesvariantid,
            ranked_data.designid,
            ranked_data.jewelriesproducttype,
            ranked_data.jewelriesgender,
            ranked_data.jewelriesappliquematerial,
            ranked_data.jewelriesfiness,
            ranked_data.jewelriesmaterialcolor,
            ranked_data.jewelriessizetype,
            ranked_data.jewelriesringsize,
            ranked_data.source_table,
            ranked_data.haravan_product_type
           FROM ranked_data
          WHERE (ranked_data.rn = 1)
        )
 SELECT f.haravan_product_id,
    f.haravan_variant_id,
    f.barcode,
    f.diamondreportno,
    f.price,
    f.diamondcogs,
    f.productgroup,
    f.diamondshape,
    f.diamondcut,
    f.diamondcolor,
    f.diamondclarity,
    f.diamondfluorescence,
    f.diamondlength,
    f.diamondwidth,
    f.diamondcarat,
    f.jewelriesvariantid,
    f.designid,
    f.jewelriesproducttype,
    f.jewelriesgender,
    f.jewelriesappliquematerial,
    f.jewelriesfiness,
    f.jewelriesmaterialcolor,
    f.jewelriessizetype,
    f.jewelriesringsize,
    f.source_table,
    f.haravan_product_type,
    hv.sku
   FROM (final_query f
     LEFT JOIN haravan.variants hv ON ((f.haravan_variant_id = hv.id)));


--
-- Name: gold_prices; Type: TABLE; Schema: supplychain; Owner: -
--

CREATE TABLE supplychain.gold_prices (
    "timestamp" numeric NOT NULL,
    metal text,
    currency text,
    exchange text,
    symbol text,
    prev_close_price double precision,
    open_price double precision,
    low_price double precision,
    high_price double precision,
    open_time integer,
    price double precision,
    ch double precision,
    chp double precision,
    ask double precision,
    bid double precision,
    price_gram_24k double precision,
    price_gram_22k double precision,
    price_gram_21k double precision,
    price_gram_20k double precision,
    price_gram_18k double precision,
    price_gram_16k double precision,
    price_gram_14k double precision,
    price_gram_10k double precision
);


--
-- Name: jewelry_design_items; Type: TABLE; Schema: supplychain; Owner: -
--

CREATE TABLE supplychain.jewelry_design_items (
    record_id text NOT NULL,
    design_code text,
    sku text,
    descriptive_attribute text,
    material text,
    material_applique text,
    category text,
    color text,
    ring_size numeric,
    ring_size_type text,
    edge_size_1 text,
    edge_size_2 text,
    storage_size_type text,
    serial_quantity integer,
    link_3dm text,
    link_4view text,
    folder_link text,
    status_checked_3dm_4view boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    record_id_hash text GENERATED ALWAYS AS (md5(record_id)) STORED
);


--
-- Name: jewelry_price; Type: TABLE; Schema: supplychain; Owner: -
--

CREATE TABLE supplychain.jewelry_price (
    record_id text NOT NULL,
    design_id bigint,
    design_code text,
    is_check_gold_melee boolean,
    is_price_confirm boolean,
    material text,
    gold_weight numeric(12,3),
    melee_number integer,
    diamond_cost numeric(14,0),
    gold_cost numeric(14,0),
    labour_cost numeric(14,0),
    bracklet_cost numeric(14,0),
    cogs_percent numeric(5,4),
    discount numeric(5,4),
    proposal_price numeric(14,0),
    final_price numeric(14,0),
    tag text
);


--
-- Name: jewelry_purchase_order_line_items; Type: TABLE; Schema: supplychain; Owner: -
--

CREATE TABLE supplychain.jewelry_purchase_order_line_items (
    order_product_id text,
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    sku_id text,
    expected_factory_delivery_date timestamp without time zone,
    expected_customer_delivery_date timestamp without time zone,
    order_quantity integer,
    cogs double precision,
    record_id text NOT NULL,
    status text,
    stage text,
    supplier_gold_cost_per_unit bigint,
    total_melee_cost double precision,
    melee_description text,
    serial_number text,
    supplier_melee_description text,
    gold_weight numeric,
    labour_cost double precision,
    melee_weight numeric,
    gold_cost double precision,
    hash_sku_id text,
    hash_order_product_id text,
    received_date timestamp without time zone,
    product_error boolean,
    db_update_at timestamp without time zone
);


--
-- Name: jewelry_purchase_orders; Type: TABLE; Schema: supplychain; Owner: -
--

CREATE TABLE supplychain.jewelry_purchase_orders (
    record_id text NOT NULL,
    order_product_id text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    ticket_name text,
    linked_descriptive_id text,
    order_type text,
    order_date timestamp with time zone,
    expected_factory_delivery_date timestamp with time zone,
    expected_customer_delivery_date timestamp with time zone,
    order_file_url text,
    customer_name text,
    order_quantity integer,
    supplier_name text,
    cogs numeric,
    status text,
    linked_descriptive_id_hash text GENERATED ALWAYS AS (md5(linked_descriptive_id)) STORED,
    record_id_hash text GENERATED ALWAYS AS (md5(record_id)) STORED,
    urgent_level text,
    haravan_order_code text,
    db_update_at timestamp without time zone
);


--
-- Name: jewelry_quotation_log; Type: TABLE; Schema: supplychain; Owner: -
--

CREATE TABLE supplychain.jewelry_quotation_log (
    ticket_name double precision,
    stage text,
    trandate timestamp without time zone,
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    record_id text NOT NULL,
    ticket_record_id text
);


--
-- Name: jewelry_ticket_quotation; Type: TABLE; Schema: supplychain; Owner: -
--

CREATE TABLE supplychain.jewelry_ticket_quotation (
    recordid text NOT NULL,
    ticketname double precision,
    sender text,
    customername text,
    phonenumber text,
    producttype text,
    material text,
    color text,
    ringsizetype text,
    ringsize text,
    productgroup text,
    tickettype text,
    followers text,
    actor text,
    image text,
    storagesize text,
    prioritylevel text,
    deadline timestamp without time zone,
    priorityreason text,
    policy text,
    descriptive text,
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    estimateprice double precision,
    typeofdesigncode text,
    recordlink text,
    quotation_stage text
);


--
-- Name: jewelry_variant_inventories; Type: VIEW; Schema: supplychain; Owner: -
--

CREATE VIEW supplychain.jewelry_variant_inventories AS
 SELECT p.id AS nocodb_product_id,
    p.haravan_product_id,
    v.id AS nocodb_variant_id,
    v.haravan_variant_id,
    p.design_id,
    d.design_code,
    wp.haravan_product_type,
    v.fineness,
    v.barcode,
    v.category,
    v.applique_material,
    v.size_type,
    COALESCE(v.ring_size, ((0)::bigint)::numeric) AS ring_size,
    p.published_scope,
    ((d.design_code || '_'::text) || v.fineness) AS design_code_material,
    v.price AS price_original,
        CASE
            WHEN (wp.haravan_product_type ~~* '%Bông Tai%'::text) THEN (v.price * (2)::numeric)
            ELSE v.price
        END AS price_adjusted,
    w.name,
    COALESCE(wi.qty_onhand, (0)::bigint) AS qty_onhand,
    COALESCE(wi.qty_incoming, (0)::bigint) AS qty_incoming,
    COALESCE(wi.qty_committed, (0)::bigint) AS qty_committed,
    COALESCE(wi.qty_available, (0)::bigint) AS qty_available
   FROM (((((workplace.products p
     LEFT JOIN workplace.variants v ON ((v.product_id = p.id)))
     LEFT JOIN workplace.designs d ON ((p.design_id = d.id)))
     LEFT JOIN workplace.products wp ON ((wp.id = v.product_id)))
     LEFT JOIN haravan.warehouse_inventories wi ON ((v.haravan_variant_id = wi.variant_id)))
     LEFT JOIN haravan.warehouses w ON ((wi.loc_id = w.id)))
  WHERE ((p.haravan_product_id IS NOT NULL) AND (v.haravan_variant_id IS NOT NULL));


--
-- Name: jewelry_variant_serials; Type: VIEW; Schema: supplychain; Owner: -
--

CREATE VIEW supplychain.jewelry_variant_serials AS
 SELECT vs.serial_number,
    vs.last_rfid_scan_time,
    vs.stock_at,
    v.barcode,
    vs.printing_batch,
    p.haravan_product_type,
        CASE
            WHEN (v.applique_material = 'Không'::text) THEN concat(p.haravan_product_type, ' ', 'Không Đính Á', ' ', v.fineness)
            ELSE concat(p.haravan_product_type, ' ', replace(v.applique_material, 'Trang Sức '::text, ''::text), ' ', v.fineness)
        END AS product_name,
    d.design_code,
    v.fineness,
    v.material_color,
    v.ring_size,
    vs.storage_size_type,
    vs.storage_size_1,
    vs.storage_size_2,
    v.sku,
    vs.gold_weight,
    vs.diamond_weight,
    vs.quantity,
        CASE
            WHEN (vs.printing_batch ~~* '%Tem tạm%'::text) THEN (0)::numeric
            ELSE floor(v.price)
        END AS price,
    vs.encode_barcode,
    vs.final_encoded_barcode,
    (('['::text || vs.old_barcode) || ']'::text) AS old_barcode,
    vs.order_on,
        CASE
            WHEN (vs.storage_size_type = 'Một Khoảng Giá Trị'::text) THEN concat((vs.storage_size_1)::text, '-', (vs.storage_size_2)::text)
            WHEN (vs.storage_size_type = 'Một Giá Trị'::text) THEN (vs.storage_size_2)::text
            WHEN (vs.storage_size_type = 'Nhiều Viên Chủ'::text) THEN 'Nhiều Viên Chủ'::text
            WHEN (vs.storage_size_type = 'Dài x Rộng'::text) THEN concat((vs.storage_size_1)::text, 'x', (vs.storage_size_2)::text)
            WHEN (vs.storage_size_type = 'Không Có'::text) THEN '0.0'::text
            ELSE NULL::text
        END AS storage_size_final
   FROM (((workplace.variant_serials vs
     LEFT JOIN workplace.variants v ON ((vs.variant_id = v.id)))
     LEFT JOIN workplace.products p ON ((p.id = v.product_id)))
     LEFT JOIN workplace.designs d ON ((d.id = p.design_id)))
  ORDER BY vs.last_rfid_scan_time DESC;


--
-- Name: jewelry_variants; Type: VIEW; Schema: supplychain; Owner: -
--

CREATE VIEW supplychain.jewelry_variants AS
 SELECT p.id AS nocodb_product_id,
    p.haravan_product_id,
    v.id AS nocodb_variant_id,
    v.haravan_variant_id,
    p.design_id,
    d.design_code,
    wp.haravan_product_type,
    v.fineness,
    v.barcode,
    v.category,
    v.applique_material,
    v.size_type,
    v.ring_size,
    p.published_scope,
    ((d.design_code || '_'::text) || v.fineness) AS design_code_material,
    v.price AS price_original,
        CASE
            WHEN (wp.haravan_product_type ~~* '%Bông Tai%'::text) THEN (v.price * (2)::numeric)
            ELSE v.price
        END AS price_adjusted,
    hv.qty_onhand
   FROM ((((workplace.products p
     LEFT JOIN workplace.variants v ON ((v.product_id = p.id)))
     LEFT JOIN workplace.designs d ON ((p.design_id = d.id)))
     LEFT JOIN workplace.products wp ON ((wp.id = v.product_id)))
     LEFT JOIN haravan.variants hv ON ((v.haravan_variant_id = hv.id)))
  WHERE ((p.haravan_product_id IS NOT NULL) AND (v.haravan_variant_id IS NOT NULL));


--
-- Name: mapping_cogs; Type: TABLE; Schema: supplychain; Owner: -
--

CREATE TABLE supplychain.mapping_cogs (
    haravan_product_id bigint,
    haravan_variant_id double precision,
    sku text,
    avg_cogs double precision
);


--
-- Name: neckplace_inventory; Type: VIEW; Schema: supplychain; Owner: -
--

CREATE VIEW supplychain.neckplace_inventory AS
 WITH available_inventory AS (
         SELECT v.id AS variant_id,
            TRIM(BOTH FROM split_part((p.title)::text, '-'::text, 2)) AS extracted_title,
            sum(v.qty_available) AS qty_available,
            v.price
           FROM (haravan.variants v
             LEFT JOIN haravan.products p ON ((p.id = v.product_id)))
          WHERE ((v.product_type)::text = 'Dây Chuyền Trơn'::text)
          GROUP BY v.id, v.price, p.title
        ), location_inventory AS (
         SELECT w.name,
            wi.variant_id,
            wi.qty_available
           FROM (haravan.warehouse_inventories wi
             LEFT JOIN haravan.warehouses w ON ((w.id = wi.loc_id)))
          WHERE (wi.qty_available > 0)
        )
 SELECT ai.extracted_title AS design_code,
    to_char(ai.price, 'FM999,999,999'::text) AS price,
        CASE
            WHEN (sum(
            CASE
                WHEN (li.name = '[CT] Cửa Hàng Cần Thơ'::text) THEN li.qty_available
                ELSE (0)::bigint
            END) = (0)::numeric) THEN '_'::text
            ELSE (sum(
            CASE
                WHEN (li.name = '[CT] Cửa Hàng Cần Thơ'::text) THEN li.qty_available
                ELSE (0)::bigint
            END))::text
        END AS can_tho_inventory,
        CASE
            WHEN (sum(
            CASE
                WHEN (li.name = '[HCM] Cửa Hàng HCM'::text) THEN li.qty_available
                ELSE (0)::bigint
            END) = (0)::numeric) THEN '_'::text
            ELSE (sum(
            CASE
                WHEN (li.name = '[HCM] Cửa Hàng HCM'::text) THEN li.qty_available
                ELSE (0)::bigint
            END))::text
        END AS ho_chi_minh_inventory,
        CASE
            WHEN (sum(
            CASE
                WHEN (li.name = '[HN] Cửa Hàng HN'::text) THEN li.qty_available
                ELSE (0)::bigint
            END) = (0)::numeric) THEN '_'::text
            ELSE (sum(
            CASE
                WHEN (li.name = '[HN] Cửa Hàng HN'::text) THEN li.qty_available
                ELSE (0)::bigint
            END))::text
        END AS ha_noi_inventory,
        CASE
            WHEN (sum(
            CASE
                WHEN (li.name = '[HCM] Kế Toán'::text) THEN li.qty_available
                ELSE (0)::bigint
            END) = (0)::numeric) THEN '_'::text
            ELSE (sum(
            CASE
                WHEN (li.name = '[HCM] Kế Toán'::text) THEN li.qty_available
                ELSE (0)::bigint
            END))::text
        END AS accounting_inventory,
        CASE
            WHEN (sum(li.qty_available) = (0)::numeric) THEN '_'::text
            ELSE (sum(li.qty_available))::text
        END AS total_available
   FROM (available_inventory ai
     LEFT JOIN location_inventory li ON ((ai.variant_id = li.variant_id)))
  WHERE ((ai.qty_available > 0) AND (li.name = ANY (ARRAY['[CT] Cửa Hàng Cần Thơ'::text, '[HCM] Cửa Hàng HCM'::text, '[HN] Cửa Hàng HN'::text, '[HCM] Kế Toán'::text])))
  GROUP BY ai.extracted_title, ai.price
UNION ALL
 SELECT 'Tổng cộng'::text AS design_code,
    ''::text AS price,
    to_char(sum(
        CASE
            WHEN (li.name = '[CT] Cửa Hàng Cần Thơ'::text) THEN li.qty_available
            ELSE (0)::bigint
        END), 'FM999,999,999'::text) AS can_tho_inventory,
    to_char(sum(
        CASE
            WHEN (li.name = '[HCM] Cửa Hàng HCM'::text) THEN li.qty_available
            ELSE (0)::bigint
        END), 'FM999,999,999'::text) AS ho_chi_minh_inventory,
    to_char(sum(
        CASE
            WHEN (li.name = '[HN] Cửa Hàng HN'::text) THEN li.qty_available
            ELSE (0)::bigint
        END), 'FM999,999,999'::text) AS ha_noi_inventory,
    to_char(sum(
        CASE
            WHEN (li.name = '[HCM] Kế Toán'::text) THEN li.qty_available
            ELSE (0)::bigint
        END), 'FM999,999,999'::text) AS accounting_inventory,
    to_char(sum(li.qty_available), 'FM999,999,999'::text) AS total_available
   FROM (available_inventory ai
     LEFT JOIN location_inventory li ON ((ai.variant_id = li.variant_id)))
  WHERE ((ai.qty_available > 0) AND (li.name = ANY (ARRAY['[CT] Cửa Hàng Cần Thơ'::text, '[HCM] Cửa Hàng HCM'::text, '[HN] Cửa Hàng HN'::text, '[HCM] Kế Toán'::text])));


--
-- Name: negative_inventory_variants; Type: VIEW; Schema: supplychain; Owner: -
--

CREATE VIEW supplychain.negative_inventory_variants AS
 SELECT w.name AS warehouse_name,
    v.product_type,
    v.title,
    wi.qty_onhand,
    concat('https://jemmiavn.myharavan.com/admin/products/', v.product_id, '/variants/', v.id) AS product_variant_link
   FROM ((haravan.variants v
     LEFT JOIN haravan.warehouse_inventories wi ON ((wi.variant_id = v.id)))
     LEFT JOIN haravan.warehouses w ON ((w.id = wi.loc_id)))
  WHERE ((wi.qty_onhand < 0) AND (w.name <> '[ALL] KHO XUẤT'::text))
  GROUP BY w.name, v.product_type, v.product_id, v.id, v.title, wi.qty_onhand
  ORDER BY w.name;


--
-- Name: pnj_products; Type: TABLE; Schema: supplychain; Owner: -
--

CREATE TABLE supplychain.pnj_products (
    id bigint NOT NULL,
    product_link text NOT NULL,
    category_current text,
    sku text,
    category text,
    brand text,
    price bigint,
    title text
);


--
-- Name: today_rfid_scans; Type: VIEW; Schema: supplychain; Owner: -
--

CREATE VIEW supplychain.today_rfid_scans AS
 SELECT vs.serial_number,
    vs.last_rfid_scan_time,
    vs.stock_at,
    v.barcode,
    vs.printing_batch,
    p.haravan_product_type,
        CASE
            WHEN (v.applique_material = 'Không'::text) THEN concat(p.haravan_product_type, ' ', 'Không Đính Á', ' ', v.fineness)
            ELSE concat(p.haravan_product_type, ' ', replace(v.applique_material, 'Trang Sức '::text, ''::text), ' ', v.fineness)
        END AS product_name,
    d.design_code,
    v.fineness,
    v.material_color,
    v.ring_size,
    vs.storage_size_type,
    vs.storage_size_1,
    vs.storage_size_2,
    v.sku,
    vs.gold_weight,
    vs.diamond_weight,
    vs.quantity,
        CASE
            WHEN (vs.printing_batch ~~* '%Tem tạm%'::text) THEN (0)::numeric
            ELSE floor(v.price)
        END AS price,
    vs.encode_barcode,
    vs.final_encoded_barcode,
    (('['::text || vs.old_barcode) || ']'::text) AS old_barcode,
    vs.order_on,
        CASE
            WHEN (vs.storage_size_type = 'Một Khoảng Giá Trị'::text) THEN concat((vs.storage_size_1)::text, '-', (vs.storage_size_2)::text)
            WHEN (vs.storage_size_type = 'Một Giá Trị'::text) THEN (vs.storage_size_2)::text
            WHEN (vs.storage_size_type = 'Nhiều Viên Chủ'::text) THEN 'Nhiều Viên Chủ'::text
            WHEN (vs.storage_size_type = 'Dài x Rộng'::text) THEN concat((vs.storage_size_1)::text, 'x', (vs.storage_size_2)::text)
            WHEN (vs.storage_size_type = 'Không Có'::text) THEN '0.0'::text
            ELSE NULL::text
        END AS storage_size_final
   FROM (((workplace.variant_serials vs
     LEFT JOIN workplace.variants v ON ((vs.variant_id = v.id)))
     LEFT JOIN workplace.products p ON ((p.id = v.product_id)))
     LEFT JOIN workplace.designs d ON ((d.id = p.design_id)))
  WHERE ((vs.last_rfid_scan_time)::date >= (CURRENT_DATE - '1 day'::interval))
  ORDER BY vs.last_rfid_scan_time DESC;


--
-- Name: variant_price_changes; Type: VIEW; Schema: supplychain; Owner: -
--

CREATE VIEW supplychain.variant_price_changes AS
 WITH variants_cte AS (
         SELECT p.id AS nocodb_product_id,
            p.haravan_product_id,
            v.id AS nocodb_variant_id,
            v.haravan_variant_id,
            p.design_id,
            p.published_scope,
            d.design_code,
            v.fineness,
            ((d.design_code || '_'::text) || v.fineness) AS design_code_material,
            v.price AS old_price,
            hv.qty_onhand
           FROM (((workplace.products p
             LEFT JOIN workplace.variants v ON ((v.product_id = p.id)))
             LEFT JOIN workplace.designs d ON ((p.design_id = d.id)))
             LEFT JOIN haravan.variants hv ON ((v.haravan_variant_id = hv.id)))
          WHERE ((p.haravan_product_id IS NOT NULL) AND (v.haravan_variant_id IS NOT NULL))
        ), price_changes_cte AS (
         SELECT j.design_id,
            d.design_code,
            d.design_type,
            j.material,
            ((j.design_code || '_'::text) || j.material) AS design_code_material,
                CASE
                    WHEN (d.design_type = 'Bông Tai'::text) THEN (j.proposal_price / (2)::numeric)
                    ELSE j.proposal_price
                END AS new_price,
            j.tag
           FROM (supplychain.jewelry_price j
             LEFT JOIN workplace.designs d ON ((j.design_id = d.id)))
        )
 SELECT vcte.nocodb_product_id,
    vcte.haravan_product_id,
    vcte.nocodb_variant_id,
    vcte.haravan_variant_id,
    vcte.design_id,
    vcte.design_code,
    vcte.fineness,
    vcte.published_scope,
    vcte.design_code_material,
    pcte.new_price,
    vcte.old_price,
    (pcte.new_price - vcte.old_price) AS diff_price,
    ((pcte.new_price - vcte.old_price) / NULLIF(pcte.new_price, (0)::numeric)) AS percent_diff_price,
    vcte.qty_onhand,
    pcte.tag
   FROM (variants_cte vcte
     LEFT JOIN price_changes_cte pcte ON ((vcte.design_code_material = pcte.design_code_material)))
  WHERE (pcte.new_price IS NOT NULL);


--
-- Name: warehouse_scan_status; Type: VIEW; Schema: supplychain; Owner: -
--

CREATE VIEW supplychain.warehouse_scan_status AS
 WITH scan_flags AS (
         SELECT i.warehouse_id,
            bool_or(((i.created_at)::date = CURRENT_DATE)) AS has_today,
            bool_or(((i.created_at)::date = (CURRENT_DATE - '1 day'::interval))) AS has_yesterday
           FROM inventory.inventory_check_sheets i
          WHERE ((i.created_at)::date = ANY (ARRAY[(CURRENT_DATE)::timestamp without time zone, (CURRENT_DATE - '1 day'::interval)]))
          GROUP BY i.warehouse_id
        ), inventory_sum AS (
         SELECT wi.loc_id AS warehouse_id,
            sum(wi.qty_onhand) AS current_inventory_number
           FROM haravan.warehouse_inventories wi
          GROUP BY wi.loc_id
        ), person_in_charge_map AS (
         SELECT t.warehouse_id,
            t.person_in_charge
           FROM ( VALUES (3421435,'@Nguyễn Thu Trà, @Nguyễn Hữu Phúc'::text), (1110168,'@Phạm Tiểu Khả, @Trịnh Thị Minh Thư'::text), (1582708,'@Nguyễn Thị Kiều Oanh, @Nguyễn Thị Thuỳ Linh'::text), (1587596,'Quản lý chung'::text), (1590860,'@Nguyễn Thị Kiều Oanh, @Nguyễn Thị Thuỳ Linh'::text), (1592770,'@Ngô Thuỵ Kiều Trinh, @Nguyễn Phương Thảo'::text), (1592774,'@Ngô Thuỵ Kiều Trinh, @Nguyễn Phương Thảo'::text), (1592776,'@Phạm Tiểu Khả, @Trịnh Thị Minh Thư'::text), (1592778,'@Trần Thị Hoài Thu'::text), (1592780,'@Nguyễn Thị Kiều Oanh, @Nguyễn Thị Thuỳ Linh'::text), (1593276,'@Nguyễn Minh Đang'::text), (1594118,'@Trần Thị Hoài Thu'::text), (1599764,'@Nguyễn Thị Kiều Oanh, @Nguyễn Thị Thuỳ Linh'::text), (1601006,'@Trần Thị Hoài Thu'::text), (1601632,'Anh @Hoàng Xuân Thọ'::text), (1619562,'@Phan Thị Huế'::text), (1710693,'@Châu Cẩm Tiên'::text), (1710694,'@Nguyễn Minh Đang'::text), (1710695,'@Nguyễn Minh Đang'::text), (1710696,'@Nguyễn Minh Đang'::text), (1715010,'Chưa rõ'::text), (3355305,'@Phạm Tiểu Khả, @Trịnh Thị Minh Thư'::text), (1599762,'Chưa rõ'::text)) t(warehouse_id, person_in_charge)
        )
 SELECT w.name AS warehouse_name,
    COALESCE(pic.person_in_charge, 'Chưa rõ'::text) AS person_in_charge,
        CASE
            WHEN COALESCE(sf.has_today, false) THEN 'X'::text
            ELSE ''::text
        END AS scan_today,
        CASE
            WHEN COALESCE(sf.has_yesterday, false) THEN 'X'::text
            ELSE ''::text
        END AS scan_yesterday,
    COALESCE(to_char(inv.current_inventory_number, 'FM999,999,999'::text), '0'::text) AS current_inventory_number
   FROM (((haravan.warehouses w
     LEFT JOIN scan_flags sf ON ((sf.warehouse_id = (w.id)::numeric)))
     LEFT JOIN inventory_sum inv ON ((inv.warehouse_id = w.id)))
     LEFT JOIN person_in_charge_map pic ON ((pic.warehouse_id = w.id)))
  ORDER BY w.name;


--
-- Name: _nc_m2m_haravan_collect_products; Type: TABLE; Schema: workplace; Owner: -
--

CREATE TABLE workplace._nc_m2m_haravan_collect_products (
    products_id integer NOT NULL,
    haravan_collections_id integer NOT NULL
);


--
-- Name: collections; Type: TABLE; Schema: workplace; Owner: -
--

CREATE TABLE workplace.collections (
    id integer NOT NULL,
    collection_name text,
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    created_by character varying,
    updated_by character varying,
    database_updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    database_created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    air text
);


--
-- Name: collections_id_seq; Type: SEQUENCE; Schema: workplace; Owner: -
--

CREATE SEQUENCE workplace.collections_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: collections_id_seq; Type: SEQUENCE OWNED BY; Schema: workplace; Owner: -
--

ALTER SEQUENCE workplace.collections_id_seq OWNED BY workplace.collections.id;


--
-- Name: design_details; Type: TABLE; Schema: workplace; Owner: -
--

CREATE TABLE workplace.design_details (
    id integer NOT NULL,
    gold_weight numeric DEFAULT 0 NOT NULL,
    labour_cost numeric DEFAULT 0 NOT NULL,
    shape_of_main_stone text,
    main_stone_length numeric,
    main_stone_width numeric,
    melee_total_price numeric
);


--
-- Name: design_details_id_seq; Type: SEQUENCE; Schema: workplace; Owner: -
--

CREATE SEQUENCE workplace.design_details_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: design_details_id_seq; Type: SEQUENCE OWNED BY; Schema: workplace; Owner: -
--

ALTER SEQUENCE workplace.design_details_id_seq OWNED BY workplace.design_details.id;


--
-- Name: design_images; Type: TABLE; Schema: workplace; Owner: -
--

CREATE TABLE workplace.design_images (
    id integer NOT NULL,
    design_id integer,
    material_color text DEFAULT 'Vàng Trắng'::text,
    retouch text,
    database_created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    database_updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    tick_sync_to_haravan boolean DEFAULT false,
    note text
);


--
-- Name: design_images_id_seq; Type: SEQUENCE; Schema: workplace; Owner: -
--

CREATE SEQUENCE workplace.design_images_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: design_images_id_seq; Type: SEQUENCE OWNED BY; Schema: workplace; Owner: -
--

ALTER SEQUENCE workplace.design_images_id_seq OWNED BY workplace.design_images.id;


--
-- Name: design_melee_details; Type: TABLE; Schema: workplace; Owner: -
--

CREATE TABLE workplace.design_melee_details (
    id integer NOT NULL,
    design_detail_id integer NOT NULL,
    quantity integer NOT NULL
);


--
-- Name: design_melee_details_id_seq; Type: SEQUENCE; Schema: workplace; Owner: -
--

CREATE SEQUENCE workplace.design_melee_details_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: design_melee_details_id_seq; Type: SEQUENCE OWNED BY; Schema: workplace; Owner: -
--

ALTER SEQUENCE workplace.design_melee_details_id_seq OWNED BY workplace.design_melee_details.id;


--
-- Name: design_price_estimation; Type: TABLE; Schema: workplace; Owner: -
--

CREATE TABLE workplace.design_price_estimation (
    id integer NOT NULL,
    code text,
    ref_price numeric,
    discount_ref_price numeric,
    design_id integer
);


--
-- Name: design_price_estimation_id_seq; Type: SEQUENCE; Schema: workplace; Owner: -
--

CREATE SEQUENCE workplace.design_price_estimation_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: design_price_estimation_id_seq; Type: SEQUENCE OWNED BY; Schema: workplace; Owner: -
--

ALTER SEQUENCE workplace.design_price_estimation_id_seq OWNED BY workplace.design_price_estimation.id;


--
-- Name: design_products_id_seq; Type: SEQUENCE; Schema: workplace; Owner: -
--

CREATE SEQUENCE workplace.design_products_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: design_products_id_seq1; Type: SEQUENCE; Schema: workplace; Owner: -
--

CREATE SEQUENCE workplace.design_products_id_seq1
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: design_products_id_seq1; Type: SEQUENCE OWNED BY; Schema: workplace; Owner: -
--

ALTER SEQUENCE workplace.design_products_id_seq1 OWNED BY workplace.designs.id;


--
-- Name: design_set; Type: TABLE; Schema: workplace; Owner: -
--

CREATE TABLE workplace.design_set (
    id integer NOT NULL,
    design_id integer,
    set_id integer,
    database_created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    database_updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: design_set_id_seq; Type: SEQUENCE; Schema: workplace; Owner: -
--

CREATE SEQUENCE workplace.design_set_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: design_set_id_seq; Type: SEQUENCE OWNED BY; Schema: workplace; Owner: -
--

ALTER SEQUENCE workplace.design_set_id_seq OWNED BY workplace.design_set.id;


--
-- Name: designs_temporary_products; Type: TABLE; Schema: workplace; Owner: -
--

CREATE TABLE workplace.designs_temporary_products (
    id integer NOT NULL,
    design_code text,
    design_type text,
    gender text,
    cover text,
    link_render text,
    code text,
    erp_code text,
    backup_code text,
    lark_record_id text
);


--
-- Name: diamomds_id_seq; Type: SEQUENCE; Schema: workplace; Owner: -
--

CREATE SEQUENCE workplace.diamomds_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: diamomds_id_seq; Type: SEQUENCE OWNED BY; Schema: workplace; Owner: -
--

ALTER SEQUENCE workplace.diamomds_id_seq OWNED BY workplace.diamonds.id;


--
-- Name: diamond_price_list; Type: TABLE; Schema: workplace; Owner: -
--

CREATE TABLE workplace.diamond_price_list (
    id integer NOT NULL,
    database_created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    database_updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    size numeric,
    color text,
    clarity text,
    carat text,
    price numeric
);


--
-- Name: diamond_price_list_id_seq; Type: SEQUENCE; Schema: workplace; Owner: -
--

CREATE SEQUENCE workplace.diamond_price_list_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: diamond_price_list_id_seq; Type: SEQUENCE OWNED BY; Schema: workplace; Owner: -
--

ALTER SEQUENCE workplace.diamond_price_list_id_seq OWNED BY workplace.diamond_price_list.id;


--
-- Name: ecom_360; Type: TABLE; Schema: workplace; Owner: -
--

CREATE TABLE workplace.ecom_360 (
    id integer NOT NULL,
    product_id integer,
    path text DEFAULT 'https://90814f99c119cd5dc08362580f81a76f.r2.cloudflarestorage.com/jemmia-images/glb/'::text,
    file_name text
);


--
-- Name: ecom_360_id_seq; Type: SEQUENCE; Schema: workplace; Owner: -
--

CREATE SEQUENCE workplace.ecom_360_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ecom_360_id_seq; Type: SEQUENCE OWNED BY; Schema: workplace; Owner: -
--

ALTER SEQUENCE workplace.ecom_360_id_seq OWNED BY workplace.ecom_360.id;


--
-- Name: ecom_old_products; Type: TABLE; Schema: workplace; Owner: -
--

CREATE TABLE workplace.ecom_old_products (
    id integer NOT NULL,
    product_id integer,
    variant_id integer,
    published_scope character varying(50),
    product_type character varying(50),
    template_suffix character varying(50),
    title character varying(64),
    code character varying(50),
    shape character varying(50),
    color character varying(50),
    material character varying(50),
    band character varying(50),
    design_id integer
);


--
-- Name: ecom_old_products_id_seq; Type: SEQUENCE; Schema: workplace; Owner: -
--

CREATE SEQUENCE workplace.ecom_old_products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ecom_old_products_id_seq; Type: SEQUENCE OWNED BY; Schema: workplace; Owner: -
--

ALTER SEQUENCE workplace.ecom_old_products_id_seq OWNED BY workplace.ecom_old_products.id;


--
-- Name: haravan_collections; Type: TABLE; Schema: workplace; Owner: -
--

CREATE TABLE workplace.haravan_collections (
    id integer NOT NULL,
    collection_type text DEFAULT 'custom_collection'::text,
    title text NOT NULL,
    products_count integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    haravan_id bigint,
    auto_create boolean DEFAULT false,
    auto_add_product_type text,
    handle text
);


--
-- Name: hrv_locations_1; Type: TABLE; Schema: workplace; Owner: -
--

CREATE TABLE workplace.hrv_locations_1 (
    id integer NOT NULL,
    name character varying
);


--
-- Name: hrv_locations_1_id_seq; Type: SEQUENCE; Schema: workplace; Owner: -
--

CREATE SEQUENCE workplace.hrv_locations_1_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: hrv_locations_1_id_seq; Type: SEQUENCE OWNED BY; Schema: workplace; Owner: -
--

ALTER SEQUENCE workplace.hrv_locations_1_id_seq OWNED BY workplace.hrv_locations_1.id;


--
-- Name: jewelries_id_seq; Type: SEQUENCE; Schema: workplace; Owner: -
--

CREATE SEQUENCE workplace.jewelries_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: jewelries_id_seq; Type: SEQUENCE OWNED BY; Schema: workplace; Owner: -
--

ALTER SEQUENCE workplace.jewelries_id_seq OWNED BY workplace.jewelries.id;


--
-- Name: materials; Type: TABLE; Schema: workplace; Owner: -
--

CREATE TABLE workplace.materials (
    id integer NOT NULL,
    name text NOT NULL,
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    created_by character varying,
    updated_by character varying,
    market_price numeric NOT NULL,
    percentage double precision
);


--
-- Name: materials_id_seq; Type: SEQUENCE; Schema: workplace; Owner: -
--

CREATE SEQUENCE workplace.materials_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: materials_id_seq; Type: SEQUENCE OWNED BY; Schema: workplace; Owner: -
--

ALTER SEQUENCE workplace.materials_id_seq OWNED BY workplace.materials.id;


--
-- Name: melee_diamonds_id_seq; Type: SEQUENCE; Schema: workplace; Owner: -
--

CREATE SEQUENCE workplace.melee_diamonds_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: melee_diamonds_id_seq; Type: SEQUENCE OWNED BY; Schema: workplace; Owner: -
--

ALTER SEQUENCE workplace.melee_diamonds_id_seq OWNED BY workplace.melee_diamonds.id;


--
-- Name: moissanite_id_seq; Type: SEQUENCE; Schema: workplace; Owner: -
--

CREATE SEQUENCE workplace.moissanite_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: moissanite_id_seq; Type: SEQUENCE OWNED BY; Schema: workplace; Owner: -
--

ALTER SEQUENCE workplace.moissanite_id_seq OWNED BY workplace.moissanite.id;


--
-- Name: moissanite_serials; Type: TABLE; Schema: workplace; Owner: -
--

CREATE TABLE workplace.moissanite_serials (
    id integer NOT NULL,
    final_encoded_rfid text,
    moissanite_id integer,
    database_updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    database_created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: moissanite_serials_id_seq; Type: SEQUENCE; Schema: workplace; Owner: -
--

CREATE SEQUENCE workplace.moissanite_serials_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: moissanite_serials_id_seq; Type: SEQUENCE OWNED BY; Schema: workplace; Owner: -
--

ALTER SEQUENCE workplace.moissanite_serials_id_seq OWNED BY workplace.moissanite_serials.id;


--
-- Name: product_collections_id_seq; Type: SEQUENCE; Schema: workplace; Owner: -
--

CREATE SEQUENCE workplace.product_collections_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: product_collections_id_seq; Type: SEQUENCE OWNED BY; Schema: workplace; Owner: -
--

ALTER SEQUENCE workplace.product_collections_id_seq OWNED BY workplace.haravan_collections.id;


--
-- Name: products_id_seq; Type: SEQUENCE; Schema: workplace; Owner: -
--

CREATE SEQUENCE workplace.products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: products_id_seq; Type: SEQUENCE OWNED BY; Schema: workplace; Owner: -
--

ALTER SEQUENCE workplace.products_id_seq OWNED BY workplace.products.id;


--
-- Name: promotions; Type: TABLE; Schema: workplace; Owner: -
--

CREATE TABLE workplace.promotions (
    id integer NOT NULL,
    name text,
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    created_by character varying,
    updated_by character varying,
    database_updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    database_created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    starts_at timestamp without time zone,
    ends_at timestamp without time zone,
    take_type text,
    set_time_active timestamp without time zone,
    status text,
    value bigint,
    products_selection text,
    promotion_id bigint,
    link_to_admind text
);


--
-- Name: promotions_id_seq; Type: SEQUENCE; Schema: workplace; Owner: -
--

CREATE SEQUENCE workplace.promotions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: promotions_id_seq; Type: SEQUENCE OWNED BY; Schema: workplace; Owner: -
--

ALTER SEQUENCE workplace.promotions_id_seq OWNED BY workplace.promotions.id;


--
-- Name: sets; Type: TABLE; Schema: workplace; Owner: -
--

CREATE TABLE workplace.sets (
    id integer NOT NULL,
    set_name text,
    database_created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    database_updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    design_codes text,
    haravan_product_id integer,
    haravan_variant_id integer,
    note text,
    main_image_link text
);


--
-- Name: sets_id_seq; Type: SEQUENCE; Schema: workplace; Owner: -
--

CREATE SEQUENCE workplace.sets_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: sets_id_seq; Type: SEQUENCE OWNED BY; Schema: workplace; Owner: -
--

ALTER SEQUENCE workplace.sets_id_seq OWNED BY workplace.sets.id;


--
-- Name: size_details; Type: TABLE; Schema: workplace; Owner: -
--

CREATE TABLE workplace.size_details (
    id integer NOT NULL,
    panel_size_type text,
    length numeric,
    quantity bigint,
    jewelry_id integer,
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    created_by character varying,
    updated_by character varying,
    database_updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    database_created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    width numeric
);


--
-- Name: size_details_id_seq; Type: SEQUENCE; Schema: workplace; Owner: -
--

CREATE SEQUENCE workplace.size_details_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: size_details_id_seq; Type: SEQUENCE OWNED BY; Schema: workplace; Owner: -
--

ALTER SEQUENCE workplace.size_details_id_seq OWNED BY workplace.size_details.id;


--
-- Name: submitted_codes; Type: TABLE; Schema: workplace; Owner: -
--

CREATE TABLE workplace.submitted_codes (
    id integer NOT NULL,
    codes text NOT NULL,
    created_by character varying,
    notes text,
    database_updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    database_created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    tag text
);


--
-- Name: submitted_codes_id_seq; Type: SEQUENCE; Schema: workplace; Owner: -
--

CREATE SEQUENCE workplace.submitted_codes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: submitted_codes_id_seq; Type: SEQUENCE OWNED BY; Schema: workplace; Owner: -
--

ALTER SEQUENCE workplace.submitted_codes_id_seq OWNED BY workplace.submitted_codes.id;


--
-- Name: temporary_products_id_seq; Type: SEQUENCE; Schema: workplace; Owner: -
--

CREATE SEQUENCE workplace.temporary_products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: temporary_products_id_seq; Type: SEQUENCE OWNED BY; Schema: workplace; Owner: -
--

ALTER SEQUENCE workplace.temporary_products_id_seq OWNED BY workplace.temporary_products.id;


--
-- Name: temporary_products_web; Type: TABLE; Schema: workplace; Owner: -
--

CREATE TABLE workplace.temporary_products_web (
    id bigint NOT NULL,
    customer_name character varying,
    customer_phone character varying,
    original_hrv_product_id character varying,
    original_hrv_variant_id character varying,
    token character varying,
    title character varying,
    price bigint,
    line_price bigint,
    price_original bigint,
    line_price_orginal bigint,
    quantity integer,
    sku character varying,
    grams double precision,
    product_type character varying,
    vendor character varying,
    properties jsonb,
    gift_card boolean,
    url character varying,
    image character varying,
    handle character varying,
    requires_shipping boolean,
    not_allow_promotion boolean,
    product_title character varying,
    barcode character varying,
    product_description character varying,
    variant_title character varying,
    variant_options jsonb,
    promotionref character varying,
    promotionby jsonb,
    haravan_product_id bigint,
    haravan_variant_id bigint
);


--
-- Name: temporary_products_web_id_seq; Type: SEQUENCE; Schema: workplace; Owner: -
--

CREATE SEQUENCE workplace.temporary_products_web_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: temporary_products_web_id_seq; Type: SEQUENCE OWNED BY; Schema: workplace; Owner: -
--

ALTER SEQUENCE workplace.temporary_products_web_id_seq OWNED BY workplace.temporary_products_web.id;


--
-- Name: temtab; Type: TABLE; Schema: workplace; Owner: -
--

CREATE TABLE workplace.temtab (
    design_code text,
    link_3d text,
    column3 character varying(50),
    column4 character varying(50),
    column5 character varying(50),
    column6 character varying(50),
    column7 character varying(50),
    column8 character varying(50),
    column9 character varying(50),
    column10 character varying(50),
    column11 character varying(50),
    column12 character varying(50),
    column13 character varying(50),
    column14 character varying(50),
    column15 character varying(50),
    column16 character varying(50),
    column17 character varying(50),
    column18 character varying(50),
    column19 character varying(50),
    column20 character varying(50)
);


--
-- Name: variant_serials_id_seq; Type: SEQUENCE; Schema: workplace; Owner: -
--

CREATE SEQUENCE workplace.variant_serials_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: variant_serials_id_seq; Type: SEQUENCE OWNED BY; Schema: workplace; Owner: -
--

ALTER SEQUENCE workplace.variant_serials_id_seq OWNED BY workplace.variant_serials.id;


--
-- Name: variant_serials_lark; Type: TABLE; Schema: workplace; Owner: -
--

CREATE TABLE workplace.variant_serials_lark (
    id integer NOT NULL,
    lark_record_id text,
    db_created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: variants_id_seq; Type: SEQUENCE; Schema: workplace; Owner: -
--

CREATE SEQUENCE workplace.variants_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: variants_id_seq; Type: SEQUENCE OWNED BY; Schema: workplace; Owner: -
--

ALTER SEQUENCE workplace.variants_id_seq OWNED BY workplace.variants.id;


--
-- Name: wedding_rings; Type: TABLE; Schema: workplace; Owner: -
--

CREATE TABLE workplace.wedding_rings (
    id integer NOT NULL,
    description text,
    ecom_title text
);


--
-- Name: wedding_rings_id_seq; Type: SEQUENCE; Schema: workplace; Owner: -
--

CREATE SEQUENCE workplace.wedding_rings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: wedding_rings_id_seq; Type: SEQUENCE OWNED BY; Schema: workplace; Owner: -
--

ALTER SEQUENCE workplace.wedding_rings_id_seq OWNED BY workplace.wedding_rings.id;


--
-- Name: time_dim col; Type: DEFAULT; Schema: dashboard_reporting; Owner: -
--

ALTER TABLE ONLY dashboard_reporting.time_dim ALTER COLUMN col SET DEFAULT nextval('dashboard_reporting.time_dim_col_seq'::regclass);


--
-- Name: leads id; Type: DEFAULT; Schema: ecom; Owner: -
--

ALTER TABLE ONLY ecom.leads ALTER COLUMN id SET DEFAULT nextval('ecom.leads_id_seq'::regclass);


--
-- Name: report_no_data id; Type: DEFAULT; Schema: gia; Owner: -
--

ALTER TABLE ONLY gia.report_no_data ALTER COLUMN id SET DEFAULT nextval('gia.report_no_data_id_seq'::regclass);


--
-- Name: buyback_exchange_approval_instances id; Type: DEFAULT; Schema: larksuite; Owner: -
--

ALTER TABLE ONLY larksuite.buyback_exchange_approval_instances ALTER COLUMN id SET DEFAULT nextval('larksuite.buyback_exchange_approval_instances_id_seq'::regclass);


--
-- Name: lark_warehouse_inventories id; Type: DEFAULT; Schema: larksuite; Owner: -
--

ALTER TABLE ONLY larksuite.lark_warehouse_inventories ALTER COLUMN id SET DEFAULT nextval('larksuite.warehouse_inventories_lark_id_seq'::regclass);


--
-- Name: promotion_approval id; Type: DEFAULT; Schema: larksuite; Owner: -
--

ALTER TABLE ONLY larksuite.promotion_approval ALTER COLUMN id SET DEFAULT nextval('larksuite.promotion_approval_id_seq'::regclass);


--
-- Name: time_dim col; Type: DEFAULT; Schema: reporting; Owner: -
--

ALTER TABLE ONLY reporting.time_dim ALTER COLUMN col SET DEFAULT nextval('reporting.time_dim_col_seq'::regclass);


--
-- Name: conversation_embeddings id; Type: DEFAULT; Schema: salesaya; Owner: -
--

ALTER TABLE ONLY salesaya.conversation_embeddings ALTER COLUMN id SET DEFAULT nextval('salesaya.conversation_embeddings_id_seq'::regclass);


--
-- Name: diamond_clarities id; Type: DEFAULT; Schema: salesaya; Owner: -
--

ALTER TABLE ONLY salesaya.diamond_clarities ALTER COLUMN id SET DEFAULT nextval('salesaya.diamond_clarities_id_seq'::regclass);


--
-- Name: diamond_colors id; Type: DEFAULT; Schema: salesaya; Owner: -
--

ALTER TABLE ONLY salesaya.diamond_colors ALTER COLUMN id SET DEFAULT nextval('salesaya.diamond_colors_id_seq'::regclass);


--
-- Name: diamond_shapes id; Type: DEFAULT; Schema: salesaya; Owner: -
--

ALTER TABLE ONLY salesaya.diamond_shapes ALTER COLUMN id SET DEFAULT nextval('salesaya.diamond_shapes_id_seq'::regclass);


--
-- Name: diamond_sizes id; Type: DEFAULT; Schema: salesaya; Owner: -
--

ALTER TABLE ONLY salesaya.diamond_sizes ALTER COLUMN id SET DEFAULT nextval('salesaya.diamond_sizes_id_seq'::regclass);


--
-- Name: embeddings id; Type: DEFAULT; Schema: salesaya; Owner: -
--

ALTER TABLE ONLY salesaya.embeddings ALTER COLUMN id SET DEFAULT nextval('salesaya.embeddings_id_seq'::regclass);


--
-- Name: gold_types id; Type: DEFAULT; Schema: salesaya; Owner: -
--

ALTER TABLE ONLY salesaya.gold_types ALTER COLUMN id SET DEFAULT nextval('salesaya.gold_types_id_seq'::regclass);


--
-- Name: items id; Type: DEFAULT; Schema: salesaya; Owner: -
--

ALTER TABLE ONLY salesaya.items ALTER COLUMN id SET DEFAULT nextval('salesaya.items_id_seq'::regclass);


--
-- Name: jewelry_categories id; Type: DEFAULT; Schema: salesaya; Owner: -
--

ALTER TABLE ONLY salesaya.jewelry_categories ALTER COLUMN id SET DEFAULT nextval('salesaya.jewelry_types_id_seq'::regclass);


--
-- Name: jewelry_needs id; Type: DEFAULT; Schema: salesaya; Owner: -
--

ALTER TABLE ONLY salesaya.jewelry_needs ALTER COLUMN id SET DEFAULT nextval('salesaya.jewelry_needs_id_seq'::regclass);


--
-- Name: jewelry_types id; Type: DEFAULT; Schema: salesaya; Owner: -
--

ALTER TABLE ONLY salesaya.jewelry_types ALTER COLUMN id SET DEFAULT nextval('salesaya.jewelry_types_id_seq1'::regclass);


--
-- Name: materials id; Type: DEFAULT; Schema: salesaya; Owner: -
--

ALTER TABLE ONLY salesaya.materials ALTER COLUMN id SET DEFAULT nextval('salesaya.materials_id_seq'::regclass);


--
-- Name: design_melee id; Type: DEFAULT; Schema: supplychain; Owner: -
--

ALTER TABLE ONLY supplychain.design_melee ALTER COLUMN id SET DEFAULT nextval('supplychain.design_melee_id_seq'::regclass);


--
-- Name: collections id; Type: DEFAULT; Schema: workplace; Owner: -
--

ALTER TABLE ONLY workplace.collections ALTER COLUMN id SET DEFAULT nextval('workplace.collections_id_seq'::regclass);


--
-- Name: design_details id; Type: DEFAULT; Schema: workplace; Owner: -
--

ALTER TABLE ONLY workplace.design_details ALTER COLUMN id SET DEFAULT nextval('workplace.design_details_id_seq'::regclass);


--
-- Name: design_images id; Type: DEFAULT; Schema: workplace; Owner: -
--

ALTER TABLE ONLY workplace.design_images ALTER COLUMN id SET DEFAULT nextval('workplace.design_images_id_seq'::regclass);


--
-- Name: design_melee_details id; Type: DEFAULT; Schema: workplace; Owner: -
--

ALTER TABLE ONLY workplace.design_melee_details ALTER COLUMN id SET DEFAULT nextval('workplace.design_melee_details_id_seq'::regclass);


--
-- Name: design_price_estimation id; Type: DEFAULT; Schema: workplace; Owner: -
--

ALTER TABLE ONLY workplace.design_price_estimation ALTER COLUMN id SET DEFAULT nextval('workplace.design_price_estimation_id_seq'::regclass);


--
-- Name: design_set id; Type: DEFAULT; Schema: workplace; Owner: -
--

ALTER TABLE ONLY workplace.design_set ALTER COLUMN id SET DEFAULT nextval('workplace.design_set_id_seq'::regclass);


--
-- Name: designs id; Type: DEFAULT; Schema: workplace; Owner: -
--

ALTER TABLE ONLY workplace.designs ALTER COLUMN id SET DEFAULT nextval('workplace.design_products_id_seq1'::regclass);


--
-- Name: diamond_price_list id; Type: DEFAULT; Schema: workplace; Owner: -
--

ALTER TABLE ONLY workplace.diamond_price_list ALTER COLUMN id SET DEFAULT nextval('workplace.diamond_price_list_id_seq'::regclass);


--
-- Name: diamonds id; Type: DEFAULT; Schema: workplace; Owner: -
--

ALTER TABLE ONLY workplace.diamonds ALTER COLUMN id SET DEFAULT nextval('workplace.diamomds_id_seq'::regclass);


--
-- Name: ecom_360 id; Type: DEFAULT; Schema: workplace; Owner: -
--

ALTER TABLE ONLY workplace.ecom_360 ALTER COLUMN id SET DEFAULT nextval('workplace.ecom_360_id_seq'::regclass);


--
-- Name: ecom_old_products id; Type: DEFAULT; Schema: workplace; Owner: -
--

ALTER TABLE ONLY workplace.ecom_old_products ALTER COLUMN id SET DEFAULT nextval('workplace.ecom_old_products_id_seq'::regclass);


--
-- Name: haravan_collections id; Type: DEFAULT; Schema: workplace; Owner: -
--

ALTER TABLE ONLY workplace.haravan_collections ALTER COLUMN id SET DEFAULT nextval('workplace.product_collections_id_seq'::regclass);


--
-- Name: hrv_locations_1 id; Type: DEFAULT; Schema: workplace; Owner: -
--

ALTER TABLE ONLY workplace.hrv_locations_1 ALTER COLUMN id SET DEFAULT nextval('workplace.hrv_locations_1_id_seq'::regclass);


--
-- Name: jewelries id; Type: DEFAULT; Schema: workplace; Owner: -
--

ALTER TABLE ONLY workplace.jewelries ALTER COLUMN id SET DEFAULT nextval('workplace.jewelries_id_seq'::regclass);


--
-- Name: materials id; Type: DEFAULT; Schema: workplace; Owner: -
--

ALTER TABLE ONLY workplace.materials ALTER COLUMN id SET DEFAULT nextval('workplace.materials_id_seq'::regclass);


--
-- Name: melee_diamonds id; Type: DEFAULT; Schema: workplace; Owner: -
--

ALTER TABLE ONLY workplace.melee_diamonds ALTER COLUMN id SET DEFAULT nextval('workplace.melee_diamonds_id_seq'::regclass);


--
-- Name: moissanite id; Type: DEFAULT; Schema: workplace; Owner: -
--

ALTER TABLE ONLY workplace.moissanite ALTER COLUMN id SET DEFAULT nextval('workplace.moissanite_id_seq'::regclass);


--
-- Name: moissanite_serials id; Type: DEFAULT; Schema: workplace; Owner: -
--

ALTER TABLE ONLY workplace.moissanite_serials ALTER COLUMN id SET DEFAULT nextval('workplace.moissanite_serials_id_seq'::regclass);


--
-- Name: products id; Type: DEFAULT; Schema: workplace; Owner: -
--

ALTER TABLE ONLY workplace.products ALTER COLUMN id SET DEFAULT nextval('workplace.products_id_seq'::regclass);


--
-- Name: promotions id; Type: DEFAULT; Schema: workplace; Owner: -
--

ALTER TABLE ONLY workplace.promotions ALTER COLUMN id SET DEFAULT nextval('workplace.promotions_id_seq'::regclass);


--
-- Name: sets id; Type: DEFAULT; Schema: workplace; Owner: -
--

ALTER TABLE ONLY workplace.sets ALTER COLUMN id SET DEFAULT nextval('workplace.sets_id_seq'::regclass);


--
-- Name: size_details id; Type: DEFAULT; Schema: workplace; Owner: -
--

ALTER TABLE ONLY workplace.size_details ALTER COLUMN id SET DEFAULT nextval('workplace.size_details_id_seq'::regclass);


--
-- Name: submitted_codes id; Type: DEFAULT; Schema: workplace; Owner: -
--

ALTER TABLE ONLY workplace.submitted_codes ALTER COLUMN id SET DEFAULT nextval('workplace.submitted_codes_id_seq'::regclass);


--
-- Name: temporary_products id; Type: DEFAULT; Schema: workplace; Owner: -
--

ALTER TABLE ONLY workplace.temporary_products ALTER COLUMN id SET DEFAULT nextval('workplace.temporary_products_id_seq'::regclass);


--
-- Name: temporary_products_web id; Type: DEFAULT; Schema: workplace; Owner: -
--

ALTER TABLE ONLY workplace.temporary_products_web ALTER COLUMN id SET DEFAULT nextval('workplace.temporary_products_web_id_seq'::regclass);


--
-- Name: variant_serials id; Type: DEFAULT; Schema: workplace; Owner: -
--

ALTER TABLE ONLY workplace.variant_serials ALTER COLUMN id SET DEFAULT nextval('workplace.variant_serials_id_seq'::regclass);


--
-- Name: variants id; Type: DEFAULT; Schema: workplace; Owner: -
--

ALTER TABLE ONLY workplace.variants ALTER COLUMN id SET DEFAULT nextval('workplace.variants_id_seq'::regclass);


--
-- Name: wedding_rings id; Type: DEFAULT; Schema: workplace; Owner: -
--

ALTER TABLE ONLY workplace.wedding_rings ALTER COLUMN id SET DEFAULT nextval('workplace.wedding_rings_id_seq'::regclass);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: workplace; Owner: -
--

ALTER TABLE ONLY workplace.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: materialized_products; Type: MATERIALIZED VIEW; Schema: ecom; Owner: -
--

CREATE MATERIALIZED VIEW ecom.materialized_products AS
 WITH products AS (
         SELECT DISTINCT ON (p_1.id) p_1.id,
            d_1.design_type,
            v.applique_material,
            d_1.gender,
                CASE
                    WHEN (d_1.diamond_holder = 'Có ổ chủ'::text) THEN 'Vỏ'::text
                    ELSE ''::text
                END AS cover,
                CASE
                    WHEN (p_1.haravan_product_type = ANY (ARRAY['Bông Tai'::text, 'Bông Tai Nguyên Chiếc'::text])) THEN (COALESCE(max(
                    CASE
                        WHEN (v.fineness = 'Vàng 18K'::text) THEN vv.price
                        ELSE NULL::numeric
                    END), max(
                    CASE
                        WHEN (v.fineness = 'Vàng 14K'::text) THEN vv.price
                        ELSE NULL::numeric
                    END)) * (2)::numeric)
                    ELSE COALESCE(max(
                    CASE
                        WHEN (v.fineness = 'Vàng 18K'::text) THEN vv.price
                        ELSE NULL::numeric
                    END), max(
                    CASE
                        WHEN (v.fineness = 'Vàng 14K'::text) THEN vv.price
                        ELSE NULL::numeric
                    END))
                END AS max_price_18,
                CASE
                    WHEN (p_1.haravan_product_type = ANY (ARRAY['Bông Tai'::text, 'Bông Tai Nguyên Chiếc'::text])) THEN (COALESCE(max(
                    CASE
                        WHEN (v.fineness = 'Vàng 14K'::text) THEN vv.price
                        ELSE NULL::numeric
                    END), max(
                    CASE
                        WHEN (v.fineness = 'Vàng 18K'::text) THEN vv.price
                        ELSE NULL::numeric
                    END)) * (2)::numeric)
                    ELSE COALESCE(max(
                    CASE
                        WHEN (v.fineness = 'Vàng 14K'::text) THEN vv.price
                        ELSE NULL::numeric
                    END), max(
                    CASE
                        WHEN (v.fineness = 'Vàng 18K'::text) THEN vv.price
                        ELSE NULL::numeric
                    END))
                END AS max_price_14,
                CASE
                    WHEN (p_1.haravan_product_type = ANY (ARRAY['Bông Tai'::text, 'Bông Tai Nguyên Chiếc'::text])) THEN (min(vv.price) * (2)::numeric)
                    ELSE min(vv.price)
                END AS min_price,
                CASE
                    WHEN (p_1.haravan_product_type = ANY (ARRAY['Bông Tai'::text, 'Bông Tai Nguyên Chiếc'::text])) THEN (max(vv.price) * (2)::numeric)
                    ELSE max(vv.price)
                END AS max_price,
            string_agg(DISTINCT v.fineness, ', '::text) AS fineness,
            string_agg(DISTINCT v.material_color, ', '::text) AS material_colors
           FROM (((workplace.products p_1
             JOIN workplace.designs d_1 ON ((p_1.design_id = d_1.id)))
             JOIN workplace.variants v ON ((p_1.id = v.product_id)))
             JOIN haravan.variants vv ON ((vv.id = v.haravan_variant_id)))
          WHERE ((v.applique_material = ANY (ARRAY['Kim Cương Tự Nhiên'::text, 'Không Đính Đá'::text, 'Moissanite'::text])) AND (vv.price > (0)::numeric))
          GROUP BY p_1.id, d_1.design_type, v.applique_material, d_1.gender, d_1.diamond_holder
        ), stock AS (
         SELECT v.product_id,
            sum(v.qty_onhand) AS qty_onhand
           FROM haravan.variants v
          GROUP BY v.product_id
        ), primary_collections AS (
         SELECT DISTINCT ON (p_1.haravan_product_id) p_1.haravan_product_id,
            hc.title AS primary_collection,
            hc.handle AS primary_collection_handle
           FROM ((workplace.products p_1
             LEFT JOIN haravan.collection_product cp ON ((p_1.haravan_product_id = cp.product_id)))
             LEFT JOIN workplace.haravan_collections hc ON ((hc.haravan_id = cp.collection_id)))
          WHERE (hc.handle IS NOT NULL)
          ORDER BY p_1.haravan_product_id, hc.haravan_id
        )
 SELECT p.haravan_product_id,
    p.haravan_product_type,
    pp.handle,
        CASE
            WHEN ((pp.product_type)::text = ANY (ARRAY[('Nhẫn Nữ'::character varying)::text, ('Nhẫn Nữ Nguyên Chiếc'::character varying)::text])) THEN 'Nhẫn Nữ'::text
            WHEN ((pp.product_type)::text = ANY (ARRAY[('Nhẫn Nam'::character varying)::text, ('Nhẫn Nam Nguyên Chiếc'::character varying)::text])) THEN 'Nhẫn Nam'::text
            WHEN ((pp.product_type)::text = ANY (ARRAY[('Bông Tai'::character varying)::text, ('Bông Tai Nguyên Chiếc'::character varying)::text])) THEN 'Bông Tai'::text
            WHEN ((pp.product_type)::text = ANY (ARRAY[('Dây Chuyền Liền Mặt'::character varying)::text, ('Mặt Dây Chuyền'::character varying)::text, ('Vòng Cổ'::character varying)::text])) THEN 'Mặt Dây Chuyền'::text
            WHEN ((pp.product_type)::text = ANY (ARRAY[('Lắc Tay'::character varying)::text, ('Vòng Tay'::character varying)::text])) THEN 'Lắc Tay'::text
            WHEN ((pp.product_type)::text = 'Nhẫn Cưới'::text) THEN 'Nhẫn Cưới'::text
            WHEN ((pp.product_type)::text = 'Huy Hiệu'::text) THEN 'Huy Hiệu'::text
            ELSE ''::text
        END AS category,
    d.wedding_ring_id,
    TRIM(BOTH FROM concat(products.cover, ' ', products.design_type, ' ', products.applique_material, ' ', products.gender)) AS title,
        CASE
            WHEN (p.g1_promotion = '16%'::text) THEN (products.max_price_14 * 0.84)
            ELSE products.max_price_14
        END AS max_price_14,
        CASE
            WHEN (p.g1_promotion = '16%'::text) THEN (products.max_price_18 * 0.84)
            ELSE products.max_price_18
        END AS max_price_18,
        CASE
            WHEN (p.g1_promotion = '16%'::text) THEN (products.min_price * 0.84)
            ELSE products.min_price
        END AS min_price,
        CASE
            WHEN (p.g1_promotion = '16%'::text) THEN (products.max_price * 0.84)
            ELSE products.max_price
        END AS max_price,
    stock.qty_onhand,
    primary_collections.primary_collection,
    primary_collections.primary_collection_handle,
    products.fineness,
    products.material_colors,
    p.estimated_gold_weight,
    p.ecom_title,
    p.id AS workplace_id,
        CASE
            WHEN (e.product_id IS NULL) THEN false
            ELSE true
        END AS has_360,
        CASE
            WHEN (e.product_id IS NOT NULL) THEN concat('/jemmia-images/glb/', d.design_code, '.glb')
            ELSE NULL::text
        END AS path_to_360,
    d.id AS design_id
   FROM ((((((workplace.designs d
     JOIN workplace.products p ON ((d.id = p.design_id)))
     JOIN haravan.products pp ON ((pp.id = p.haravan_product_id)))
     JOIN products ON ((products.id = p.id)))
     JOIN stock ON ((stock.product_id = p.haravan_product_id)))
     LEFT JOIN primary_collections ON ((primary_collections.haravan_product_id = p.haravan_product_id)))
     LEFT JOIN workplace.ecom_360 e ON ((p.id = e.product_id)))
  WHERE (((pp.published_scope)::text = ANY (ARRAY[('global'::character varying)::text, ('web'::character varying)::text])) AND ((pp.product_type)::text = ANY (ARRAY[('Bông Tai'::character varying)::text, ('Bông Tai Nguyên Chiếc'::character varying)::text, ('Dây Chuyền Liền Mặt'::character varying)::text, ('Lắc Tay'::character varying)::text, ('Mặt Dây Chuyền'::character varying)::text, ('Nhẫn Nam'::character varying)::text, ('Nhẫn Nữ'::character varying)::text, ('Nhẫn Nữ Nguyên Chiếc'::character varying)::text, ('Nhẫn Nam Nguyên Chiếc'::character varying)::text, ('Vòng Cổ'::character varying)::text, ('Vòng Tay'::character varying)::text, ('Nhẫn Cưới'::character varying)::text, ('Dây Chuyền Trơn'::character varying)::text, ('Huy Hiệu'::character varying)::text])))
  WITH NO DATA;


--
-- Name: materialized_wedding_rings; Type: MATERIALIZED VIEW; Schema: ecom; Owner: -
--

CREATE MATERIALIZED VIEW ecom.materialized_wedding_rings AS
 WITH valid_wedding_rings AS (
         SELECT wr_1.id
           FROM ((((workplace.wedding_rings wr_1
             JOIN workplace.designs d_1 ON ((wr_1.id = d_1.wedding_ring_id)))
             JOIN workplace.products p_1 ON ((d_1.id = p_1.design_id)))
             JOIN haravan.products pp_1 ON ((p_1.haravan_product_id = pp_1.id)))
             JOIN ecom.products ppp_1 ON ((p_1.haravan_product_id = ppp_1.haravan_product_id)))
          WHERE ((1 = 1) AND ((pp_1.published_scope)::text = 'global'::text) AND (d_1.gender = ANY (ARRAY['Nam'::text, 'Nữ'::text])) AND (d_1.design_type = 'Nhẫn Cưới'::text))
          GROUP BY wr_1.id
         HAVING ((count(DISTINCT pp_1.published_scope) = 1) AND (count(DISTINCT d_1.gender) = 2))
        )
 SELECT wr.id,
    concat('Nhẫn Cưới ', string_agg(DISTINCT d.design_code, ' / '::text)) AS title,
    sum(ppp.max_price) AS max_price,
    sum(ppp.min_price) AS min_price,
    string_agg(DISTINCT fineness_value.fineness_value, ', '::text) AS fineness,
    string_agg(DISTINCT material_color_value.material_color_value, ', '::text) AS material_colors,
    sum(ppp.qty_onhand) AS qty_onhand
   FROM ((((((workplace.wedding_rings wr
     JOIN workplace.designs d ON ((wr.id = d.wedding_ring_id)))
     JOIN workplace.products p ON ((d.id = p.design_id)))
     JOIN haravan.products pp ON ((p.haravan_product_id = pp.id)))
     JOIN ecom.materialized_products ppp ON ((p.haravan_product_id = ppp.haravan_product_id)))
     CROSS JOIN LATERAL unnest(string_to_array(ppp.fineness, ', '::text)) fineness_value(fineness_value))
     CROSS JOIN LATERAL unnest(string_to_array(ppp.material_colors, ', '::text)) material_color_value(material_color_value))
  WHERE (wr.id IN ( SELECT valid_wedding_rings.id
           FROM valid_wedding_rings))
  GROUP BY wr.id
  WITH NO DATA;


--
-- Name: platforms platforms_pkey; Type: CONSTRAINT; Schema: advertising_cost; Owner: -
--

ALTER TABLE ONLY advertising_cost.platforms
    ADD CONSTRAINT platforms_pkey PRIMARY KEY (uuid);


--
-- Name: allocations allocations_pkey; Type: CONSTRAINT; Schema: bizflycrm; Owner: -
--

ALTER TABLE ONLY bizflycrm.allocations
    ADD CONSTRAINT allocations_pkey PRIMARY KEY (uuid);


--
-- Name: calls calls_pkey; Type: CONSTRAINT; Schema: bizflycrm; Owner: -
--

ALTER TABLE ONLY bizflycrm.calls
    ADD CONSTRAINT calls_pkey PRIMARY KEY (uuid);


--
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: bizflycrm; Owner: -
--

ALTER TABLE ONLY bizflycrm.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (uuid);


--
-- Name: departments departments_pkey; Type: CONSTRAINT; Schema: bizflycrm; Owner: -
--

ALTER TABLE ONLY bizflycrm.departments
    ADD CONSTRAINT departments_pkey PRIMARY KEY (uuid);


--
-- Name: kpis kpis_pkey; Type: CONSTRAINT; Schema: bizflycrm; Owner: -
--

ALTER TABLE ONLY bizflycrm.kpis
    ADD CONSTRAINT kpis_pkey PRIMARY KEY (uuid);


--
-- Name: line_items line_items_pkey; Type: CONSTRAINT; Schema: bizflycrm; Owner: -
--

ALTER TABLE ONLY bizflycrm.line_items
    ADD CONSTRAINT line_items_pkey PRIMARY KEY (uuid);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: bizflycrm; Owner: -
--

ALTER TABLE ONLY bizflycrm.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (uuid);


--
-- Name: orders_receipts orders_receipts_pkey; Type: CONSTRAINT; Schema: bizflycrm; Owner: -
--

ALTER TABLE ONLY bizflycrm.orders_receipts
    ADD CONSTRAINT orders_receipts_pkey PRIMARY KEY (uuid);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: bizflycrm; Owner: -
--

ALTER TABLE ONLY bizflycrm.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (uuid);


--
-- Name: promotions promotions_pkey; Type: CONSTRAINT; Schema: bizflycrm; Owner: -
--

ALTER TABLE ONLY bizflycrm.promotions
    ADD CONSTRAINT promotions_pkey PRIMARY KEY (uuid);


--
-- Name: serial_numbers serial_numbers_pkey; Type: CONSTRAINT; Schema: bizflycrm; Owner: -
--

ALTER TABLE ONLY bizflycrm.serial_numbers
    ADD CONSTRAINT serial_numbers_pkey PRIMARY KEY (uuid);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: bizflycrm; Owner: -
--

ALTER TABLE ONLY bizflycrm.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (uuid);


--
-- Name: time_dim time_dim_pkey; Type: CONSTRAINT; Schema: dashboard_reporting; Owner: -
--

ALTER TABLE ONLY dashboard_reporting.time_dim
    ADD CONSTRAINT time_dim_pkey PRIMARY KEY (col);


--
-- Name: leads leads_custom_uuid_key; Type: CONSTRAINT; Schema: ecom; Owner: -
--

ALTER TABLE ONLY ecom.leads
    ADD CONSTRAINT leads_custom_uuid_key UNIQUE (custom_uuid);


--
-- Name: leads leads_pkey; Type: CONSTRAINT; Schema: ecom; Owner: -
--

ALTER TABLE ONLY ecom.leads
    ADD CONSTRAINT leads_pkey PRIMARY KEY (id);


--
-- Name: products products_unique_haravan_id; Type: CONSTRAINT; Schema: ecom; Owner: -
--

ALTER TABLE ONLY ecom.products
    ADD CONSTRAINT products_unique_haravan_id UNIQUE (haravan_product_id);


--
-- Name: qr_generator qr_generator_pkey; Type: CONSTRAINT; Schema: ecom; Owner: -
--

ALTER TABLE ONLY ecom.qr_generator
    ADD CONSTRAINT qr_generator_pkey PRIMARY KEY (id);


--
-- Name: variants unique_haravan_variant_id; Type: CONSTRAINT; Schema: ecom; Owner: -
--

ALTER TABLE ONLY ecom.variants
    ADD CONSTRAINT unique_haravan_variant_id UNIQUE (haravan_variant_id);


--
-- Name: wedding_rings wedding_rings_id_key; Type: CONSTRAINT; Schema: ecom; Owner: -
--

ALTER TABLE ONLY ecom.wedding_rings
    ADD CONSTRAINT wedding_rings_id_key UNIQUE (id);


--
-- Name: order_tracking order_tracking_haravan_order_id_key; Type: CONSTRAINT; Schema: ecommerce; Owner: -
--

ALTER TABLE ONLY ecommerce.order_tracking
    ADD CONSTRAINT order_tracking_haravan_order_id_key UNIQUE (haravan_order_id, haravan_order_status);


--
-- Name: order_tracking order_tracking_pkey; Type: CONSTRAINT; Schema: ecommerce; Owner: -
--

ALTER TABLE ONLY ecommerce.order_tracking
    ADD CONSTRAINT order_tracking_pkey PRIMARY KEY (uuid);


--
-- Name: addresses addresses_pkey; Type: CONSTRAINT; Schema: erpnext; Owner: -
--

ALTER TABLE ONLY erpnext.addresses
    ADD CONSTRAINT addresses_pkey PRIMARY KEY (uuid);


--
-- Name: contacts contacts_pkey; Type: CONSTRAINT; Schema: erpnext; Owner: -
--

ALTER TABLE ONLY erpnext.contacts
    ADD CONSTRAINT contacts_pkey PRIMARY KEY (uuid);


--
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: erpnext; Owner: -
--

ALTER TABLE ONLY erpnext.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (uuid);


--
-- Name: employees employees_pkey; Type: CONSTRAINT; Schema: erpnext; Owner: -
--

ALTER TABLE ONLY erpnext.employees
    ADD CONSTRAINT employees_pkey PRIMARY KEY (uuid);


--
-- Name: lead_budgets lead_budgets_pkey; Type: CONSTRAINT; Schema: erpnext; Owner: -
--

ALTER TABLE ONLY erpnext.lead_budgets
    ADD CONSTRAINT lead_budgets_pkey PRIMARY KEY (uuid);


--
-- Name: lead_demands lead_demands_pkey; Type: CONSTRAINT; Schema: erpnext; Owner: -
--

ALTER TABLE ONLY erpnext.lead_demands
    ADD CONSTRAINT lead_demands_pkey PRIMARY KEY (uuid);


--
-- Name: lead_sources lead_sources_name_key; Type: CONSTRAINT; Schema: erpnext; Owner: -
--

ALTER TABLE ONLY erpnext.lead_sources
    ADD CONSTRAINT lead_sources_name_key UNIQUE (name);


--
-- Name: lead_sources lead_sources_pkey; Type: CONSTRAINT; Schema: erpnext; Owner: -
--

ALTER TABLE ONLY erpnext.lead_sources
    ADD CONSTRAINT lead_sources_pkey PRIMARY KEY (uuid);


--
-- Name: leads leads_pkey; Type: CONSTRAINT; Schema: erpnext; Owner: -
--

ALTER TABLE ONLY erpnext.leads
    ADD CONSTRAINT leads_pkey PRIMARY KEY (uuid);


--
-- Name: product_categories product_categories_pkey; Type: CONSTRAINT; Schema: erpnext; Owner: -
--

ALTER TABLE ONLY erpnext.product_categories
    ADD CONSTRAINT product_categories_pkey PRIMARY KEY (uuid);


--
-- Name: promotions promotions_pkey; Type: CONSTRAINT; Schema: erpnext; Owner: -
--

ALTER TABLE ONLY erpnext.promotions
    ADD CONSTRAINT promotions_pkey PRIMARY KEY (uuid);


--
-- Name: provinces provinces_pkey; Type: CONSTRAINT; Schema: erpnext; Owner: -
--

ALTER TABLE ONLY erpnext.provinces
    ADD CONSTRAINT provinces_pkey PRIMARY KEY (uuid);


--
-- Name: purchase_purposes purchase_purposes_pkey; Type: CONSTRAINT; Schema: erpnext; Owner: -
--

ALTER TABLE ONLY erpnext.purchase_purposes
    ADD CONSTRAINT purchase_purposes_pkey PRIMARY KEY (uuid);


--
-- Name: regions regions_pkey; Type: CONSTRAINT; Schema: erpnext; Owner: -
--

ALTER TABLE ONLY erpnext.regions
    ADD CONSTRAINT regions_pkey PRIMARY KEY (uuid);


--
-- Name: sales_order_notification_tracking sales_order_notification_tracking_pkey; Type: CONSTRAINT; Schema: erpnext; Owner: -
--

ALTER TABLE ONLY erpnext.sales_order_notification_tracking
    ADD CONSTRAINT sales_order_notification_tracking_pkey PRIMARY KEY (uuid);


--
-- Name: sales_orders sales_orders_pkey; Type: CONSTRAINT; Schema: erpnext; Owner: -
--

ALTER TABLE ONLY erpnext.sales_orders
    ADD CONSTRAINT sales_orders_pkey PRIMARY KEY (uuid);


--
-- Name: sales_persons sales_persons_pkey; Type: CONSTRAINT; Schema: erpnext; Owner: -
--

ALTER TABLE ONLY erpnext.sales_persons
    ADD CONSTRAINT sales_persons_pkey PRIMARY KEY (uuid);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: erpnext; Owner: -
--

ALTER TABLE ONLY erpnext.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (uuid);


--
-- Name: report_no_data report_no_data_pkey; Type: CONSTRAINT; Schema: gia; Owner: -
--

ALTER TABLE ONLY gia.report_no_data
    ADD CONSTRAINT report_no_data_pkey PRIMARY KEY (id);


--
-- Name: collection_product collection_product_pkey; Type: CONSTRAINT; Schema: haravan; Owner: -
--

ALTER TABLE ONLY haravan.collection_product
    ADD CONSTRAINT collection_product_pkey PRIMARY KEY (uuid);


--
-- Name: custom_collections custom_collections_pkey; Type: CONSTRAINT; Schema: haravan; Owner: -
--

ALTER TABLE ONLY haravan.custom_collections
    ADD CONSTRAINT custom_collections_pkey PRIMARY KEY (uuid);


--
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: haravan; Owner: -
--

ALTER TABLE ONLY haravan.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (uuid);


--
-- Name: fulfillments fulfillments_pkey; Type: CONSTRAINT; Schema: haravan; Owner: -
--

ALTER TABLE ONLY haravan.fulfillments
    ADD CONSTRAINT fulfillments_pkey PRIMARY KEY (uuid);


--
-- Name: images images_pkey; Type: CONSTRAINT; Schema: haravan; Owner: -
--

ALTER TABLE ONLY haravan.images
    ADD CONSTRAINT images_pkey PRIMARY KEY (uuid);


--
-- Name: inventory_logs inventory_logs_pkey; Type: CONSTRAINT; Schema: haravan; Owner: -
--

ALTER TABLE ONLY haravan.inventory_logs
    ADD CONSTRAINT inventory_logs_pkey PRIMARY KEY (id);


--
-- Name: line_items line_items_pkey; Type: CONSTRAINT; Schema: haravan; Owner: -
--

ALTER TABLE ONLY haravan.line_items
    ADD CONSTRAINT line_items_pkey PRIMARY KEY (uuid);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: haravan; Owner: -
--

ALTER TABLE ONLY haravan.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (uuid);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: haravan; Owner: -
--

ALTER TABLE ONLY haravan.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (uuid);


--
-- Name: purchase_receives_items purchase_receives_items_pkey; Type: CONSTRAINT; Schema: haravan; Owner: -
--

ALTER TABLE ONLY haravan.purchase_receives_items
    ADD CONSTRAINT purchase_receives_items_pkey PRIMARY KEY (uuid);


--
-- Name: purchase_receives purchase_receives_pkey; Type: CONSTRAINT; Schema: haravan; Owner: -
--

ALTER TABLE ONLY haravan.purchase_receives
    ADD CONSTRAINT purchase_receives_pkey PRIMARY KEY (uuid);


--
-- Name: refunds refunds_pkey; Type: CONSTRAINT; Schema: haravan; Owner: -
--

ALTER TABLE ONLY haravan.refunds
    ADD CONSTRAINT refunds_pkey PRIMARY KEY (uuid);


--
-- Name: transactions transactions_pkey; Type: CONSTRAINT; Schema: haravan; Owner: -
--

ALTER TABLE ONLY haravan.transactions
    ADD CONSTRAINT transactions_pkey PRIMARY KEY (uuid);


--
-- Name: images unique_id; Type: CONSTRAINT; Schema: haravan; Owner: -
--

ALTER TABLE ONLY haravan.images
    ADD CONSTRAINT unique_id UNIQUE (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: haravan; Owner: -
--

ALTER TABLE ONLY haravan.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (uuid);


--
-- Name: variants variants_pkey; Type: CONSTRAINT; Schema: haravan; Owner: -
--

ALTER TABLE ONLY haravan.variants
    ADD CONSTRAINT variants_pkey PRIMARY KEY (uuid);


--
-- Name: warehouse_inventories warehouse_inventories_pkey; Type: CONSTRAINT; Schema: haravan; Owner: -
--

ALTER TABLE ONLY haravan.warehouse_inventories
    ADD CONSTRAINT warehouse_inventories_pkey PRIMARY KEY (uuid);


--
-- Name: warehouses warehouses_pkey; Type: CONSTRAINT; Schema: haravan; Owner: -
--

ALTER TABLE ONLY haravan.warehouses
    ADD CONSTRAINT warehouses_pkey PRIMARY KEY (id);


--
-- Name: inventory_check_sheets inventory_check_sheets_pkey; Type: CONSTRAINT; Schema: inventory; Owner: -
--

ALTER TABLE ONLY inventory.inventory_check_sheets
    ADD CONSTRAINT inventory_check_sheets_pkey PRIMARY KEY (id);


--
-- Name: rfid_tags_warehouse rfid_tags_warehouse_pkey; Type: CONSTRAINT; Schema: inventory; Owner: -
--

ALTER TABLE ONLY inventory.rfid_tags_warehouse
    ADD CONSTRAINT rfid_tags_warehouse_pkey PRIMARY KEY (id);


--
-- Name: inventory_check_lines inventory_check_lines_pkey; Type: CONSTRAINT; Schema: inventory_cms; Owner: -
--

ALTER TABLE ONLY inventory_cms.inventory_check_lines
    ADD CONSTRAINT inventory_check_lines_pkey PRIMARY KEY (uuid);


--
-- Name: inventory_check_sheets inventory_check_sheets_pkey; Type: CONSTRAINT; Schema: inventory_cms; Owner: -
--

ALTER TABLE ONLY inventory_cms.inventory_check_sheets
    ADD CONSTRAINT inventory_check_sheets_pkey PRIMARY KEY (uuid);


--
-- Name: metadata metadata_pkey; Type: CONSTRAINT; Schema: jemmia; Owner: -
--

ALTER TABLE ONLY jemmia.metadata
    ADD CONSTRAINT metadata_pkey PRIMARY KEY (product_id);


--
-- Name: buyback_exchange_approval_instances buyback_exchange_approval_instances_instance_code_key; Type: CONSTRAINT; Schema: larksuite; Owner: -
--

ALTER TABLE ONLY larksuite.buyback_exchange_approval_instances
    ADD CONSTRAINT buyback_exchange_approval_instances_instance_code_key UNIQUE (instance_code);


--
-- Name: buyback_exchange_approval_instances buyback_exchange_approval_instances_pkey; Type: CONSTRAINT; Schema: larksuite; Owner: -
--

ALTER TABLE ONLY larksuite.buyback_exchange_approval_instances
    ADD CONSTRAINT buyback_exchange_approval_instances_pkey PRIMARY KEY (id);


--
-- Name: crm_lark_message crm_lark_message_pkey; Type: CONSTRAINT; Schema: larksuite; Owner: -
--

ALTER TABLE ONLY larksuite.crm_lark_message
    ADD CONSTRAINT crm_lark_message_pkey PRIMARY KEY (id);


--
-- Name: customer_appointments customer_appointments_pkey; Type: CONSTRAINT; Schema: larksuite; Owner: -
--

ALTER TABLE ONLY larksuite.customer_appointments
    ADD CONSTRAINT customer_appointments_pkey PRIMARY KEY (uuid);


--
-- Name: departments departments_open_department_id_key; Type: CONSTRAINT; Schema: larksuite; Owner: -
--

ALTER TABLE ONLY larksuite.departments
    ADD CONSTRAINT departments_open_department_id_key UNIQUE (open_department_id);


--
-- Name: departments departments_pkey; Type: CONSTRAINT; Schema: larksuite; Owner: -
--

ALTER TABLE ONLY larksuite.departments
    ADD CONSTRAINT departments_pkey PRIMARY KEY (department_id);


--
-- Name: groups groups_pkey; Type: CONSTRAINT; Schema: larksuite; Owner: -
--

ALTER TABLE ONLY larksuite.groups
    ADD CONSTRAINT groups_pkey PRIMARY KEY (group_id);


--
-- Name: promotion_approval instance_code_unique; Type: CONSTRAINT; Schema: larksuite; Owner: -
--

ALTER TABLE ONLY larksuite.promotion_approval
    ADD CONSTRAINT instance_code_unique UNIQUE (instance_code);


--
-- Name: instances instances_instance_code_key; Type: CONSTRAINT; Schema: larksuite; Owner: -
--

ALTER TABLE ONLY larksuite.instances
    ADD CONSTRAINT instances_instance_code_key UNIQUE (instance_code);


--
-- Name: instances instances_pkey; Type: CONSTRAINT; Schema: larksuite; Owner: -
--

ALTER TABLE ONLY larksuite.instances
    ADD CONSTRAINT instances_pkey PRIMARY KEY (uuid);


--
-- Name: instances instances_serial_number_key; Type: CONSTRAINT; Schema: larksuite; Owner: -
--

ALTER TABLE ONLY larksuite.instances
    ADD CONSTRAINT instances_serial_number_key UNIQUE (serial_number);


--
-- Name: lark_line_items_payment lark_line_items_payment_pkey; Type: CONSTRAINT; Schema: larksuite; Owner: -
--

ALTER TABLE ONLY larksuite.lark_line_items_payment
    ADD CONSTRAINT lark_line_items_payment_pkey PRIMARY KEY (order_id, variant_id);


--
-- Name: lark_order_qr_generator lark_order_qr_generator_pkey; Type: CONSTRAINT; Schema: larksuite; Owner: -
--

ALTER TABLE ONLY larksuite.lark_order_qr_generator
    ADD CONSTRAINT lark_order_qr_generator_pkey PRIMARY KEY (haravan_order_id);


--
-- Name: lark_variants lark_variants_pkey; Type: CONSTRAINT; Schema: larksuite; Owner: -
--

ALTER TABLE ONLY larksuite.lark_variants
    ADD CONSTRAINT lark_variants_pkey PRIMARY KEY (variant_id);


--
-- Name: promotion_approval promotion_approval_pkey; Type: CONSTRAINT; Schema: larksuite; Owner: -
--

ALTER TABLE ONLY larksuite.promotion_approval
    ADD CONSTRAINT promotion_approval_pkey PRIMARY KEY (id);


--
-- Name: records records_pkey; Type: CONSTRAINT; Schema: larksuite; Owner: -
--

ALTER TABLE ONLY larksuite.records
    ADD CONSTRAINT records_pkey PRIMARY KEY (uuid);


--
-- Name: shifts shifts_pkey; Type: CONSTRAINT; Schema: larksuite; Owner: -
--

ALTER TABLE ONLY larksuite.shifts
    ADD CONSTRAINT shifts_pkey PRIMARY KEY (shift_id);


--
-- Name: user_daily_shifts user_daily_shifts_pkey; Type: CONSTRAINT; Schema: larksuite; Owner: -
--

ALTER TABLE ONLY larksuite.user_daily_shifts
    ADD CONSTRAINT user_daily_shifts_pkey PRIMARY KEY (day_no, group_id, month, user_id);


--
-- Name: users users_open_id_key; Type: CONSTRAINT; Schema: larksuite; Owner: -
--

ALTER TABLE ONLY larksuite.users
    ADD CONSTRAINT users_open_id_key UNIQUE (open_id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: larksuite; Owner: -
--

ALTER TABLE ONLY larksuite.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- Name: users users_union_id_key; Type: CONSTRAINT; Schema: larksuite; Owner: -
--

ALTER TABLE ONLY larksuite.users
    ADD CONSTRAINT users_union_id_key UNIQUE (union_id);


--
-- Name: lark_warehouse_inventories warehouse_inventories_lark_pkey; Type: CONSTRAINT; Schema: larksuite; Owner: -
--

ALTER TABLE ONLY larksuite.lark_warehouse_inventories
    ADD CONSTRAINT warehouse_inventories_lark_pkey PRIMARY KEY (id);


--
-- Name: inventory_items inventory_items_pkey; Type: CONSTRAINT; Schema: misa; Owner: -
--

ALTER TABLE ONLY misa.inventory_items
    ADD CONSTRAINT inventory_items_pkey PRIMARY KEY (uuid);


--
-- Name: items items_pkey; Type: CONSTRAINT; Schema: misa; Owner: -
--

ALTER TABLE ONLY misa.items
    ADD CONSTRAINT items_pkey PRIMARY KEY (uuid);


--
-- Name: purchase_voucher_details purchase_voucher_details_pkey; Type: CONSTRAINT; Schema: misa; Owner: -
--

ALTER TABLE ONLY misa.purchase_voucher_details
    ADD CONSTRAINT purchase_voucher_details_pkey PRIMARY KEY (uuid, ref_detail_id);


--
-- Name: purchase_voucher_details purchase_voucher_details_ref_detail_id_key; Type: CONSTRAINT; Schema: misa; Owner: -
--

ALTER TABLE ONLY misa.purchase_voucher_details
    ADD CONSTRAINT purchase_voucher_details_ref_detail_id_key UNIQUE (ref_detail_id);


--
-- Name: purchase_vouchers purchase_vouchers_pkey; Type: CONSTRAINT; Schema: misa; Owner: -
--

ALTER TABLE ONLY misa.purchase_vouchers
    ADD CONSTRAINT purchase_vouchers_pkey PRIMARY KEY (uuid);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: misa; Owner: -
--

ALTER TABLE ONLY misa.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (uuid);


--
-- Name: warehouse_inventories warehouse_inventories_pkey; Type: CONSTRAINT; Schema: misa; Owner: -
--

ALTER TABLE ONLY misa.warehouse_inventories
    ADD CONSTRAINT warehouse_inventories_pkey PRIMARY KEY (inventory_item_id, stock_id);


--
-- Name: conversation_page_customer conversation_page_customer_pkey; Type: CONSTRAINT; Schema: pancake; Owner: -
--

ALTER TABLE ONLY pancake.conversation_page_customer
    ADD CONSTRAINT conversation_page_customer_pkey PRIMARY KEY (customer_id, conversation_id);


--
-- Name: conversation_page_customer conversation_page_customer_uuid_key; Type: CONSTRAINT; Schema: pancake; Owner: -
--

ALTER TABLE ONLY pancake.conversation_page_customer
    ADD CONSTRAINT conversation_page_customer_uuid_key UNIQUE (uuid);


--
-- Name: conversation conversation_pkey; Type: CONSTRAINT; Schema: pancake; Owner: -
--

ALTER TABLE ONLY pancake.conversation
    ADD CONSTRAINT conversation_pkey PRIMARY KEY (uuid);


--
-- Name: conversation_tag conversation_tag_pkey; Type: CONSTRAINT; Schema: pancake; Owner: -
--

ALTER TABLE ONLY pancake.conversation_tag
    ADD CONSTRAINT conversation_tag_pkey PRIMARY KEY (conversation_id, inserted_at, tag_page_id, action);


--
-- Name: conversation_tag conversation_tag_uuid_key; Type: CONSTRAINT; Schema: pancake; Owner: -
--

ALTER TABLE ONLY pancake.conversation_tag
    ADD CONSTRAINT conversation_tag_uuid_key UNIQUE (uuid);


--
-- Name: frappe_lead_conversation frappe_lead_conversation_pkey; Type: CONSTRAINT; Schema: pancake; Owner: -
--

ALTER TABLE ONLY pancake.frappe_lead_conversation
    ADD CONSTRAINT frappe_lead_conversation_pkey PRIMARY KEY (conversation_id);


--
-- Name: frappe_lead_conversation_stag frappe_lead_conversation_stag_pkey; Type: CONSTRAINT; Schema: pancake; Owner: -
--

ALTER TABLE ONLY pancake.frappe_lead_conversation_stag
    ADD CONSTRAINT frappe_lead_conversation_stag_pkey PRIMARY KEY (conversation_id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: pancake; Owner: -
--

ALTER TABLE ONLY pancake.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: page_customer page_customer_pkey; Type: CONSTRAINT; Schema: pancake; Owner: -
--

ALTER TABLE ONLY pancake.page_customer
    ADD CONSTRAINT page_customer_pkey PRIMARY KEY (uuid);


--
-- Name: page page_pkey; Type: CONSTRAINT; Schema: pancake; Owner: -
--

ALTER TABLE ONLY pancake.page
    ADD CONSTRAINT page_pkey PRIMARY KEY (uuid);


--
-- Name: pancake_user pancake_user_pkey; Type: CONSTRAINT; Schema: pancake; Owner: -
--

ALTER TABLE ONLY pancake.pancake_user
    ADD CONSTRAINT pancake_user_pkey PRIMARY KEY (id);


--
-- Name: tag_page tag_page_pkey; Type: CONSTRAINT; Schema: pancake; Owner: -
--

ALTER TABLE ONLY pancake.tag_page
    ADD CONSTRAINT tag_page_pkey PRIMARY KEY (page_id, id);


--
-- Name: users users_enterprise_email_key; Type: CONSTRAINT; Schema: pancake; Owner: -
--

ALTER TABLE ONLY pancake.users
    ADD CONSTRAINT users_enterprise_email_key UNIQUE (enterprise_email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: pancake; Owner: -
--

ALTER TABLE ONLY pancake.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: manual_payments manual_payments_pkey; Type: CONSTRAINT; Schema: payment; Owner: -
--

ALTER TABLE ONLY payment.manual_payments
    ADD CONSTRAINT manual_payments_pkey PRIMARY KEY (uuid);


--
-- Name: sepay_transaction sepay_transaction_pkey; Type: CONSTRAINT; Schema: payment; Owner: -
--

ALTER TABLE ONLY payment.sepay_transaction
    ADD CONSTRAINT sepay_transaction_pkey PRIMARY KEY (id);


--
-- Name: purchase_exchange_policy purchase_exchange_policy_pkey; Type: CONSTRAINT; Schema: policy; Owner: -
--

ALTER TABLE ONLY policy.purchase_exchange_policy
    ADD CONSTRAINT purchase_exchange_policy_pkey PRIMARY KEY (order_id, item_id);


--
-- Name: order_promotion_analysis order_promotion_analysis_pkey; Type: CONSTRAINT; Schema: promotion; Owner: -
--

ALTER TABLE ONLY promotion.order_promotion_analysis
    ADD CONSTRAINT order_promotion_analysis_pkey PRIMARY KEY (uuid);


--
-- Name: order_promotions order_promotions_pkey; Type: CONSTRAINT; Schema: promotion; Owner: -
--

ALTER TABLE ONLY promotion.order_promotions
    ADD CONSTRAINT order_promotions_pkey PRIMARY KEY (uuid);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: diamonds_dev diamonds_dev_pkey; Type: CONSTRAINT; Schema: rapnet; Owner: -
--

ALTER TABLE ONLY rapnet.diamonds_dev
    ADD CONSTRAINT diamonds_dev_pkey PRIMARY KEY (diamond_id);


--
-- Name: diamonds_prod diamonds_prod_pkey; Type: CONSTRAINT; Schema: rapnet; Owner: -
--

ALTER TABLE ONLY rapnet.diamonds_prod
    ADD CONSTRAINT diamonds_prod_pkey PRIMARY KEY (diamond_id);


--
-- Name: time_dim time_dim_pkey; Type: CONSTRAINT; Schema: reporting; Owner: -
--

ALTER TABLE ONLY reporting.time_dim
    ADD CONSTRAINT time_dim_pkey PRIMARY KEY (col);


--
-- Name: conversation_embeddings conversation_embeddings_pkey; Type: CONSTRAINT; Schema: salesaya; Owner: -
--

ALTER TABLE ONLY salesaya.conversation_embeddings
    ADD CONSTRAINT conversation_embeddings_pkey PRIMARY KEY (id);


--
-- Name: conversations conversation_pancake_conversation_unique; Type: CONSTRAINT; Schema: salesaya; Owner: -
--

ALTER TABLE ONLY salesaya.conversations
    ADD CONSTRAINT conversation_pancake_conversation_unique UNIQUE (pancake_conversation_id);


--
-- Name: conversations conversation_pk; Type: CONSTRAINT; Schema: salesaya; Owner: -
--

ALTER TABLE ONLY salesaya.conversations
    ADD CONSTRAINT conversation_pk PRIMARY KEY (id);


--
-- Name: customer_info customer_info_pk; Type: CONSTRAINT; Schema: salesaya; Owner: -
--

ALTER TABLE ONLY salesaya.customer_info
    ADD CONSTRAINT customer_info_pk PRIMARY KEY (id);


--
-- Name: diamond_clarities diamond_clarities_grade_key; Type: CONSTRAINT; Schema: salesaya; Owner: -
--

ALTER TABLE ONLY salesaya.diamond_clarities
    ADD CONSTRAINT diamond_clarities_grade_key UNIQUE (grade);


--
-- Name: diamond_clarities diamond_clarities_pkey; Type: CONSTRAINT; Schema: salesaya; Owner: -
--

ALTER TABLE ONLY salesaya.diamond_clarities
    ADD CONSTRAINT diamond_clarities_pkey PRIMARY KEY (id);


--
-- Name: diamond_colors diamond_colors_grade_key; Type: CONSTRAINT; Schema: salesaya; Owner: -
--

ALTER TABLE ONLY salesaya.diamond_colors
    ADD CONSTRAINT diamond_colors_grade_key UNIQUE (grade);


--
-- Name: diamond_colors diamond_colors_pkey; Type: CONSTRAINT; Schema: salesaya; Owner: -
--

ALTER TABLE ONLY salesaya.diamond_colors
    ADD CONSTRAINT diamond_colors_pkey PRIMARY KEY (id);


--
-- Name: diamond_shapes diamond_shapes_name_key; Type: CONSTRAINT; Schema: salesaya; Owner: -
--

ALTER TABLE ONLY salesaya.diamond_shapes
    ADD CONSTRAINT diamond_shapes_name_key UNIQUE (name);


--
-- Name: diamond_shapes diamond_shapes_pkey; Type: CONSTRAINT; Schema: salesaya; Owner: -
--

ALTER TABLE ONLY salesaya.diamond_shapes
    ADD CONSTRAINT diamond_shapes_pkey PRIMARY KEY (id);


--
-- Name: diamond_sizes diamond_sizes_pkey; Type: CONSTRAINT; Schema: salesaya; Owner: -
--

ALTER TABLE ONLY salesaya.diamond_sizes
    ADD CONSTRAINT diamond_sizes_pkey PRIMARY KEY (id);


--
-- Name: diamond_sizes diamond_sizes_size_key; Type: CONSTRAINT; Schema: salesaya; Owner: -
--

ALTER TABLE ONLY salesaya.diamond_sizes
    ADD CONSTRAINT diamond_sizes_size_key UNIQUE (size);


--
-- Name: embeddings embeddings_pkey; Type: CONSTRAINT; Schema: salesaya; Owner: -
--

ALTER TABLE ONLY salesaya.embeddings
    ADD CONSTRAINT embeddings_pkey PRIMARY KEY (id);


--
-- Name: gold_types gold_types_name_key; Type: CONSTRAINT; Schema: salesaya; Owner: -
--

ALTER TABLE ONLY salesaya.gold_types
    ADD CONSTRAINT gold_types_name_key UNIQUE (name);


--
-- Name: gold_types gold_types_pkey; Type: CONSTRAINT; Schema: salesaya; Owner: -
--

ALTER TABLE ONLY salesaya.gold_types
    ADD CONSTRAINT gold_types_pkey PRIMARY KEY (id);


--
-- Name: items items_pkey; Type: CONSTRAINT; Schema: salesaya; Owner: -
--

ALTER TABLE ONLY salesaya.items
    ADD CONSTRAINT items_pkey PRIMARY KEY (id);


--
-- Name: jewelry_categories jewelry_categories_name_key; Type: CONSTRAINT; Schema: salesaya; Owner: -
--

ALTER TABLE ONLY salesaya.jewelry_categories
    ADD CONSTRAINT jewelry_categories_name_key UNIQUE (name);


--
-- Name: jewelry_categories jewelry_categories_pkey; Type: CONSTRAINT; Schema: salesaya; Owner: -
--

ALTER TABLE ONLY salesaya.jewelry_categories
    ADD CONSTRAINT jewelry_categories_pkey PRIMARY KEY (id);


--
-- Name: jewelry_details jewelry_details_opportunity_unique; Type: CONSTRAINT; Schema: salesaya; Owner: -
--

ALTER TABLE ONLY salesaya.jewelry_details
    ADD CONSTRAINT jewelry_details_opportunity_unique UNIQUE (opportunity_id);


--
-- Name: jewelry_details jewelry_details_pk; Type: CONSTRAINT; Schema: salesaya; Owner: -
--

ALTER TABLE ONLY salesaya.jewelry_details
    ADD CONSTRAINT jewelry_details_pk PRIMARY KEY (id);


--
-- Name: jewelry_needs jewelry_needs_name_key; Type: CONSTRAINT; Schema: salesaya; Owner: -
--

ALTER TABLE ONLY salesaya.jewelry_needs
    ADD CONSTRAINT jewelry_needs_name_key UNIQUE (name);


--
-- Name: jewelry_needs jewelry_needs_pkey; Type: CONSTRAINT; Schema: salesaya; Owner: -
--

ALTER TABLE ONLY salesaya.jewelry_needs
    ADD CONSTRAINT jewelry_needs_pkey PRIMARY KEY (id);


--
-- Name: jewelry_types jewelry_types_name_key1; Type: CONSTRAINT; Schema: salesaya; Owner: -
--

ALTER TABLE ONLY salesaya.jewelry_types
    ADD CONSTRAINT jewelry_types_name_key1 UNIQUE (name);


--
-- Name: jewelry_types jewelry_types_pkey; Type: CONSTRAINT; Schema: salesaya; Owner: -
--

ALTER TABLE ONLY salesaya.jewelry_types
    ADD CONSTRAINT jewelry_types_pkey PRIMARY KEY (id);


--
-- Name: materials materials_name_key; Type: CONSTRAINT; Schema: salesaya; Owner: -
--

ALTER TABLE ONLY salesaya.materials
    ADD CONSTRAINT materials_name_key UNIQUE (name);


--
-- Name: materials materials_pkey; Type: CONSTRAINT; Schema: salesaya; Owner: -
--

ALTER TABLE ONLY salesaya.materials
    ADD CONSTRAINT materials_pkey PRIMARY KEY (id);


--
-- Name: messages mesages_pk; Type: CONSTRAINT; Schema: salesaya; Owner: -
--

ALTER TABLE ONLY salesaya.messages
    ADD CONSTRAINT mesages_pk PRIMARY KEY (id);


--
-- Name: opportunities opportunities_pancake_conversation_id_unique; Type: CONSTRAINT; Schema: salesaya; Owner: -
--

ALTER TABLE ONLY salesaya.opportunities
    ADD CONSTRAINT opportunities_pancake_conversation_id_unique UNIQUE (pancake_conversation_id);


--
-- Name: opportunities opportunities_pk; Type: CONSTRAINT; Schema: salesaya; Owner: -
--

ALTER TABLE ONLY salesaya.opportunities
    ADD CONSTRAINT opportunities_pk PRIMARY KEY (id);


--
-- Name: customer_info pancake_conversation_unique; Type: CONSTRAINT; Schema: salesaya; Owner: -
--

ALTER TABLE ONLY salesaya.customer_info
    ADD CONSTRAINT pancake_conversation_unique UNIQUE (pancake_conversation_id);


--
-- Name: customer_info pancake_customer_id_unique; Type: CONSTRAINT; Schema: salesaya; Owner: -
--

ALTER TABLE ONLY salesaya.customer_info
    ADD CONSTRAINT pancake_customer_id_unique UNIQUE (pancake_customer_id);


--
-- Name: buyback_exchange_approval_instances_detail buyback_exchange_approval_instances_pkey; Type: CONSTRAINT; Schema: supplychain; Owner: -
--

ALTER TABLE ONLY supplychain.buyback_exchange_approval_instances_detail
    ADD CONSTRAINT buyback_exchange_approval_instances_pkey PRIMARY KEY (request_no);


--
-- Name: design_melee design_melee_pkey; Type: CONSTRAINT; Schema: supplychain; Owner: -
--

ALTER TABLE ONLY supplychain.design_melee
    ADD CONSTRAINT design_melee_pkey PRIMARY KEY (id);


--
-- Name: designs designs_pkey; Type: CONSTRAINT; Schema: supplychain; Owner: -
--

ALTER TABLE ONLY supplychain.designs
    ADD CONSTRAINT designs_pkey PRIMARY KEY (id);


--
-- Name: diamond_attribute diamond_attribute_pk; Type: CONSTRAINT; Schema: supplychain; Owner: -
--

ALTER TABLE ONLY supplychain.diamond_attribute
    ADD CONSTRAINT diamond_attribute_pk PRIMARY KEY (report_no);


--
-- Name: diamond_purchase diamond_purchase_pk; Type: CONSTRAINT; Schema: supplychain; Owner: -
--

ALTER TABLE ONLY supplychain.diamond_purchase
    ADD CONSTRAINT diamond_purchase_pk PRIMARY KEY (report_no);


--
-- Name: diamond_quotation_log diamond_quotation_log_pkey; Type: CONSTRAINT; Schema: supplychain; Owner: -
--

ALTER TABLE ONLY supplychain.diamond_quotation_log
    ADD CONSTRAINT diamond_quotation_log_pkey PRIMARY KEY (record_id);


--
-- Name: diamond_ticket_quotation diamond_ticket_quotation_pkey; Type: CONSTRAINT; Schema: supplychain; Owner: -
--

ALTER TABLE ONLY supplychain.diamond_ticket_quotation
    ADD CONSTRAINT diamond_ticket_quotation_pkey PRIMARY KEY (record_id);


--
-- Name: gold_prices gold_prices_pkey; Type: CONSTRAINT; Schema: supplychain; Owner: -
--

ALTER TABLE ONLY supplychain.gold_prices
    ADD CONSTRAINT gold_prices_pkey PRIMARY KEY ("timestamp");


--
-- Name: jewelry_design_items jewelry_design_items_pkey; Type: CONSTRAINT; Schema: supplychain; Owner: -
--

ALTER TABLE ONLY supplychain.jewelry_design_items
    ADD CONSTRAINT jewelry_design_items_pkey PRIMARY KEY (record_id);


--
-- Name: jewelry_price jewelry_price_pkey; Type: CONSTRAINT; Schema: supplychain; Owner: -
--

ALTER TABLE ONLY supplychain.jewelry_price
    ADD CONSTRAINT jewelry_price_pkey PRIMARY KEY (record_id);


--
-- Name: jewelry_quotation_log jewelry_quotation_log_pkey; Type: CONSTRAINT; Schema: supplychain; Owner: -
--

ALTER TABLE ONLY supplychain.jewelry_quotation_log
    ADD CONSTRAINT jewelry_quotation_log_pkey PRIMARY KEY (record_id);


--
-- Name: jewelry_purchase_orders order_items_pkey; Type: CONSTRAINT; Schema: supplychain; Owner: -
--

ALTER TABLE ONLY supplychain.jewelry_purchase_orders
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (record_id);


--
-- Name: jewelry_purchase_order_line_items orders_pkey; Type: CONSTRAINT; Schema: supplychain; Owner: -
--

ALTER TABLE ONLY supplychain.jewelry_purchase_order_line_items
    ADD CONSTRAINT orders_pkey PRIMARY KEY (record_id);


--
-- Name: pnj_products pnj_products_pkey; Type: CONSTRAINT; Schema: supplychain; Owner: -
--

ALTER TABLE ONLY supplychain.pnj_products
    ADD CONSTRAINT pnj_products_pkey PRIMARY KEY (id);


--
-- Name: jewelry_ticket_quotation ticket_price_pkey; Type: CONSTRAINT; Schema: supplychain; Owner: -
--

ALTER TABLE ONLY supplychain.jewelry_ticket_quotation
    ADD CONSTRAINT ticket_price_pkey PRIMARY KEY (recordid);


--
-- Name: _nc_m2m_haravan_collect_products _nc_m2m_haravan_collect_products_pkey; Type: CONSTRAINT; Schema: workplace; Owner: -
--

ALTER TABLE ONLY workplace._nc_m2m_haravan_collect_products
    ADD CONSTRAINT _nc_m2m_haravan_collect_products_pkey PRIMARY KEY (products_id, haravan_collections_id);


--
-- Name: collections collections_pkey; Type: CONSTRAINT; Schema: workplace; Owner: -
--

ALTER TABLE ONLY workplace.collections
    ADD CONSTRAINT collections_pkey PRIMARY KEY (id);


--
-- Name: designs design_code_attributes_unique; Type: CONSTRAINT; Schema: workplace; Owner: -
--

ALTER TABLE ONLY workplace.designs
    ADD CONSTRAINT design_code_attributes_unique UNIQUE (design_type, gender, diamond_holder, source, design_year, design_seq, variant_number);


--
-- Name: design_details design_details_pkey; Type: CONSTRAINT; Schema: workplace; Owner: -
--

ALTER TABLE ONLY workplace.design_details
    ADD CONSTRAINT design_details_pkey PRIMARY KEY (id);


--
-- Name: design_images design_images_pkey; Type: CONSTRAINT; Schema: workplace; Owner: -
--

ALTER TABLE ONLY workplace.design_images
    ADD CONSTRAINT design_images_pkey PRIMARY KEY (id);


--
-- Name: design_melee_details design_melee_details_pkey; Type: CONSTRAINT; Schema: workplace; Owner: -
--

ALTER TABLE ONLY workplace.design_melee_details
    ADD CONSTRAINT design_melee_details_pkey PRIMARY KEY (id);


--
-- Name: design_price_estimation design_price_estimation_pkey; Type: CONSTRAINT; Schema: workplace; Owner: -
--

ALTER TABLE ONLY workplace.design_price_estimation
    ADD CONSTRAINT design_price_estimation_pkey PRIMARY KEY (id);


--
-- Name: designs design_products_pkey; Type: CONSTRAINT; Schema: workplace; Owner: -
--

ALTER TABLE ONLY workplace.designs
    ADD CONSTRAINT design_products_pkey PRIMARY KEY (id);


--
-- Name: design_set design_set_pkey; Type: CONSTRAINT; Schema: workplace; Owner: -
--

ALTER TABLE ONLY workplace.design_set
    ADD CONSTRAINT design_set_pkey PRIMARY KEY (id);


--
-- Name: designs_temporary_products designs_temporary_products_pkey; Type: CONSTRAINT; Schema: workplace; Owner: -
--

ALTER TABLE ONLY workplace.designs_temporary_products
    ADD CONSTRAINT designs_temporary_products_pkey PRIMARY KEY (id);


--
-- Name: diamonds diamomds_pkey; Type: CONSTRAINT; Schema: workplace; Owner: -
--

ALTER TABLE ONLY workplace.diamonds
    ADD CONSTRAINT diamomds_pkey PRIMARY KEY (id);


--
-- Name: diamond_price_list diamond_price_list_pkey; Type: CONSTRAINT; Schema: workplace; Owner: -
--

ALTER TABLE ONLY workplace.diamond_price_list
    ADD CONSTRAINT diamond_price_list_pkey PRIMARY KEY (id);


--
-- Name: ecom_360 ecom_360_pkey; Type: CONSTRAINT; Schema: workplace; Owner: -
--

ALTER TABLE ONLY workplace.ecom_360
    ADD CONSTRAINT ecom_360_pkey PRIMARY KEY (id);


--
-- Name: ecom_old_products ecom_old_products_pkey; Type: CONSTRAINT; Schema: workplace; Owner: -
--

ALTER TABLE ONLY workplace.ecom_old_products
    ADD CONSTRAINT ecom_old_products_pkey PRIMARY KEY (id);


--
-- Name: hrv_locations_1 hrv_locations_1_pkey; Type: CONSTRAINT; Schema: workplace; Owner: -
--

ALTER TABLE ONLY workplace.hrv_locations_1
    ADD CONSTRAINT hrv_locations_1_pkey PRIMARY KEY (id);


--
-- Name: jewelries jewelries_pkey; Type: CONSTRAINT; Schema: workplace; Owner: -
--

ALTER TABLE ONLY workplace.jewelries
    ADD CONSTRAINT jewelries_pkey PRIMARY KEY (id);


--
-- Name: jewelries jewelries_unique_variant_id; Type: CONSTRAINT; Schema: workplace; Owner: -
--

ALTER TABLE ONLY workplace.jewelries
    ADD CONSTRAINT jewelries_unique_variant_id UNIQUE (variant_id);


--
-- Name: materials materials_pkey; Type: CONSTRAINT; Schema: workplace; Owner: -
--

ALTER TABLE ONLY workplace.materials
    ADD CONSTRAINT materials_pkey PRIMARY KEY (id);


--
-- Name: melee_diamonds melee_diamonds_pkey; Type: CONSTRAINT; Schema: workplace; Owner: -
--

ALTER TABLE ONLY workplace.melee_diamonds
    ADD CONSTRAINT melee_diamonds_pkey PRIMARY KEY (id);


--
-- Name: moissanite moissanite_barcode_key; Type: CONSTRAINT; Schema: workplace; Owner: -
--

ALTER TABLE ONLY workplace.moissanite
    ADD CONSTRAINT moissanite_barcode_key UNIQUE (barcode);


--
-- Name: moissanite moissanite_pkey; Type: CONSTRAINT; Schema: workplace; Owner: -
--

ALTER TABLE ONLY workplace.moissanite
    ADD CONSTRAINT moissanite_pkey PRIMARY KEY (id);


--
-- Name: moissanite_serials moissanite_serials_pkey; Type: CONSTRAINT; Schema: workplace; Owner: -
--

ALTER TABLE ONLY workplace.moissanite_serials
    ADD CONSTRAINT moissanite_serials_pkey PRIMARY KEY (id);


--
-- Name: haravan_collections product_collections_pkey; Type: CONSTRAINT; Schema: workplace; Owner: -
--

ALTER TABLE ONLY workplace.haravan_collections
    ADD CONSTRAINT product_collections_pkey PRIMARY KEY (id);


--
-- Name: promotions promotions_pkey; Type: CONSTRAINT; Schema: workplace; Owner: -
--

ALTER TABLE ONLY workplace.promotions
    ADD CONSTRAINT promotions_pkey PRIMARY KEY (id);


--
-- Name: sets sets_pkey; Type: CONSTRAINT; Schema: workplace; Owner: -
--

ALTER TABLE ONLY workplace.sets
    ADD CONSTRAINT sets_pkey PRIMARY KEY (id);


--
-- Name: size_details size_details_pkey; Type: CONSTRAINT; Schema: workplace; Owner: -
--

ALTER TABLE ONLY workplace.size_details
    ADD CONSTRAINT size_details_pkey PRIMARY KEY (id);


--
-- Name: submitted_codes submitted_codes_pkey; Type: CONSTRAINT; Schema: workplace; Owner: -
--

ALTER TABLE ONLY workplace.submitted_codes
    ADD CONSTRAINT submitted_codes_pkey PRIMARY KEY (id);


--
-- Name: temporary_products temporary_products_pkey; Type: CONSTRAINT; Schema: workplace; Owner: -
--

ALTER TABLE ONLY workplace.temporary_products
    ADD CONSTRAINT temporary_products_pkey PRIMARY KEY (id);


--
-- Name: temporary_products temporary_products_variant_serial_id_key; Type: CONSTRAINT; Schema: workplace; Owner: -
--

ALTER TABLE ONLY workplace.temporary_products
    ADD CONSTRAINT temporary_products_variant_serial_id_key UNIQUE (variant_serial_id);


--
-- Name: temporary_products_web temporary_products_web_pkey; Type: CONSTRAINT; Schema: workplace; Owner: -
--

ALTER TABLE ONLY workplace.temporary_products_web
    ADD CONSTRAINT temporary_products_web_pkey PRIMARY KEY (id);


--
-- Name: temtab temtab_design_code_key; Type: CONSTRAINT; Schema: workplace; Owner: -
--

ALTER TABLE ONLY workplace.temtab
    ADD CONSTRAINT temtab_design_code_key UNIQUE (design_code);


--
-- Name: products uniqe_product_id; Type: CONSTRAINT; Schema: workplace; Owner: -
--

ALTER TABLE ONLY workplace.products
    ADD CONSTRAINT uniqe_product_id UNIQUE (haravan_product_id);


--
-- Name: variants uniqe_variant_id; Type: CONSTRAINT; Schema: workplace; Owner: -
--

ALTER TABLE ONLY workplace.variants
    ADD CONSTRAINT uniqe_variant_id UNIQUE (haravan_variant_id);


--
-- Name: variants unique_barcode; Type: CONSTRAINT; Schema: workplace; Owner: -
--

ALTER TABLE ONLY workplace.variants
    ADD CONSTRAINT unique_barcode UNIQUE (barcode);


--
-- Name: jewelries unique_barcode_jewelries; Type: CONSTRAINT; Schema: workplace; Owner: -
--

ALTER TABLE ONLY workplace.jewelries
    ADD CONSTRAINT unique_barcode_jewelries UNIQUE (barcode);


--
-- Name: designs unique_code_constraint; Type: CONSTRAINT; Schema: workplace; Owner: -
--

ALTER TABLE ONLY workplace.designs
    ADD CONSTRAINT unique_code_constraint UNIQUE (code);


--
-- Name: designs unique_design_code; Type: CONSTRAINT; Schema: workplace; Owner: -
--

ALTER TABLE ONLY workplace.designs
    ADD CONSTRAINT unique_design_code UNIQUE (code);


--
-- Name: designs unique_design_code_constraint; Type: CONSTRAINT; Schema: workplace; Owner: -
--

ALTER TABLE ONLY workplace.designs
    ADD CONSTRAINT unique_design_code_constraint UNIQUE (code);


--
-- Name: design_images unique_design_color; Type: CONSTRAINT; Schema: workplace; Owner: -
--

ALTER TABLE ONLY workplace.design_images
    ADD CONSTRAINT unique_design_color UNIQUE (design_id, material_color);


--
-- Name: products unique_design_id; Type: CONSTRAINT; Schema: workplace; Owner: -
--

ALTER TABLE ONLY workplace.products
    ADD CONSTRAINT unique_design_id UNIQUE (design_id);


--
-- Name: diamonds unique_diamond_barcode; Type: CONSTRAINT; Schema: workplace; Owner: -
--

ALTER TABLE ONLY workplace.diamonds
    ADD CONSTRAINT unique_diamond_barcode UNIQUE (barcode);


--
-- Name: variant_serials unique_final_encode_barcode; Type: CONSTRAINT; Schema: workplace; Owner: -
--

ALTER TABLE ONLY workplace.variant_serials
    ADD CONSTRAINT unique_final_encode_barcode UNIQUE (final_encoded_barcode);


--
-- Name: moissanite_serials unique_final_encoded_rfid; Type: CONSTRAINT; Schema: workplace; Owner: -
--

ALTER TABLE ONLY workplace.moissanite_serials
    ADD CONSTRAINT unique_final_encoded_rfid UNIQUE (final_encoded_rfid);


--
-- Name: designs unique_id_constraint; Type: CONSTRAINT; Schema: workplace; Owner: -
--

ALTER TABLE ONLY workplace.designs
    ADD CONSTRAINT unique_id_constraint UNIQUE (id);


--
-- Name: temporary_products unique_lark_base_record_id; Type: CONSTRAINT; Schema: workplace; Owner: -
--

ALTER TABLE ONLY workplace.temporary_products
    ADD CONSTRAINT unique_lark_base_record_id UNIQUE (lark_base_record_id);


--
-- Name: moissanite unique_moissannite_sku_attributes; Type: CONSTRAINT; Schema: workplace; Owner: -
--

ALTER TABLE ONLY workplace.moissanite
    ADD CONSTRAINT unique_moissannite_sku_attributes UNIQUE (product_group, shape, length, width, color, clarity, fluorescence, cut, polish, symmetry);


--
-- Name: variant_serials unique_serial_number; Type: CONSTRAINT; Schema: workplace; Owner: -
--

ALTER TABLE ONLY workplace.variant_serials
    ADD CONSTRAINT unique_serial_number UNIQUE (serial_number);


--
-- Name: variant_serials unique_serial_number_final_encoded_barcode; Type: CONSTRAINT; Schema: workplace; Owner: -
--

ALTER TABLE ONLY workplace.variant_serials
    ADD CONSTRAINT unique_serial_number_final_encoded_barcode UNIQUE (serial_number, final_encoded_barcode);


--
-- Name: variants unique_sku; Type: CONSTRAINT; Schema: workplace; Owner: -
--

ALTER TABLE ONLY workplace.variants
    ADD CONSTRAINT unique_sku UNIQUE (sku);


--
-- Name: variants unique_sku_attributes; Type: CONSTRAINT; Schema: workplace; Owner: -
--

ALTER TABLE ONLY workplace.variants
    ADD CONSTRAINT unique_sku_attributes UNIQUE (product_id, category, applique_material, fineness, material_color, size_type, ring_size);


--
-- Name: variant_serials_lark variant_serials_lark_pkey; Type: CONSTRAINT; Schema: workplace; Owner: -
--

ALTER TABLE ONLY workplace.variant_serials_lark
    ADD CONSTRAINT variant_serials_lark_pkey PRIMARY KEY (id);


--
-- Name: variant_serials variant_serials_pkey; Type: CONSTRAINT; Schema: workplace; Owner: -
--

ALTER TABLE ONLY workplace.variant_serials
    ADD CONSTRAINT variant_serials_pkey PRIMARY KEY (id);


--
-- Name: variants variants_pkey; Type: CONSTRAINT; Schema: workplace; Owner: -
--

ALTER TABLE ONLY workplace.variants
    ADD CONSTRAINT variants_pkey PRIMARY KEY (id);


--
-- Name: wedding_rings wedding_rings_pkey; Type: CONSTRAINT; Schema: workplace; Owner: -
--

ALTER TABLE ONLY workplace.wedding_rings
    ADD CONSTRAINT wedding_rings_pkey PRIMARY KEY (id);


--
-- Name: _hyper_2_11_chunk_gold_pricing_time_idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_2_11_chunk_gold_pricing_time_idx ON _timescaledb_internal._hyper_2_11_chunk USING btree ("time" DESC);


--
-- Name: _hyper_2_13_chunk_gold_pricing_time_idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_2_13_chunk_gold_pricing_time_idx ON _timescaledb_internal._hyper_2_13_chunk USING btree ("time" DESC);


--
-- Name: _hyper_2_15_chunk_gold_pricing_time_idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_2_15_chunk_gold_pricing_time_idx ON _timescaledb_internal._hyper_2_15_chunk USING btree ("time" DESC);


--
-- Name: _hyper_2_17_chunk_gold_pricing_time_idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_2_17_chunk_gold_pricing_time_idx ON _timescaledb_internal._hyper_2_17_chunk USING btree ("time" DESC);


--
-- Name: _hyper_2_19_chunk_gold_pricing_time_idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_2_19_chunk_gold_pricing_time_idx ON _timescaledb_internal._hyper_2_19_chunk USING btree ("time" DESC);


--
-- Name: _hyper_2_21_chunk_gold_pricing_time_idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_2_21_chunk_gold_pricing_time_idx ON _timescaledb_internal._hyper_2_21_chunk USING btree ("time" DESC);


--
-- Name: _hyper_2_23_chunk_gold_pricing_time_idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_2_23_chunk_gold_pricing_time_idx ON _timescaledb_internal._hyper_2_23_chunk USING btree ("time" DESC);


--
-- Name: _hyper_2_25_chunk_gold_pricing_time_idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_2_25_chunk_gold_pricing_time_idx ON _timescaledb_internal._hyper_2_25_chunk USING btree ("time" DESC);


--
-- Name: _hyper_2_27_chunk_gold_pricing_time_idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_2_27_chunk_gold_pricing_time_idx ON _timescaledb_internal._hyper_2_27_chunk USING btree ("time" DESC);


--
-- Name: _hyper_2_2_chunk_gold_pricing_time_idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_2_2_chunk_gold_pricing_time_idx ON _timescaledb_internal._hyper_2_2_chunk USING btree ("time" DESC);


--
-- Name: _hyper_2_9_chunk_gold_pricing_time_idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_2_9_chunk_gold_pricing_time_idx ON _timescaledb_internal._hyper_2_9_chunk USING btree ("time" DESC);


--
-- Name: _hyper_6_10_chunk_exchange_rate_time_idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_6_10_chunk_exchange_rate_time_idx ON _timescaledb_internal._hyper_6_10_chunk USING btree ("time" DESC);


--
-- Name: _hyper_6_12_chunk_exchange_rate_time_idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_6_12_chunk_exchange_rate_time_idx ON _timescaledb_internal._hyper_6_12_chunk USING btree ("time" DESC);


--
-- Name: _hyper_6_14_chunk_exchange_rate_time_idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_6_14_chunk_exchange_rate_time_idx ON _timescaledb_internal._hyper_6_14_chunk USING btree ("time" DESC);


--
-- Name: _hyper_6_16_chunk_exchange_rate_time_idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_6_16_chunk_exchange_rate_time_idx ON _timescaledb_internal._hyper_6_16_chunk USING btree ("time" DESC);


--
-- Name: _hyper_6_18_chunk_exchange_rate_time_idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_6_18_chunk_exchange_rate_time_idx ON _timescaledb_internal._hyper_6_18_chunk USING btree ("time" DESC);


--
-- Name: _hyper_6_20_chunk_exchange_rate_time_idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_6_20_chunk_exchange_rate_time_idx ON _timescaledb_internal._hyper_6_20_chunk USING btree ("time" DESC);


--
-- Name: _hyper_6_22_chunk_exchange_rate_time_idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_6_22_chunk_exchange_rate_time_idx ON _timescaledb_internal._hyper_6_22_chunk USING btree ("time" DESC);


--
-- Name: _hyper_6_24_chunk_exchange_rate_time_idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_6_24_chunk_exchange_rate_time_idx ON _timescaledb_internal._hyper_6_24_chunk USING btree ("time" DESC);


--
-- Name: _hyper_6_26_chunk_exchange_rate_time_idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_6_26_chunk_exchange_rate_time_idx ON _timescaledb_internal._hyper_6_26_chunk USING btree ("time" DESC);


--
-- Name: _hyper_6_28_chunk_exchange_rate_time_idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_6_28_chunk_exchange_rate_time_idx ON _timescaledb_internal._hyper_6_28_chunk USING btree ("time" DESC);


--
-- Name: _hyper_6_29_chunk_exchange_rate_time_idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_6_29_chunk_exchange_rate_time_idx ON _timescaledb_internal._hyper_6_29_chunk USING btree ("time" DESC);


--
-- Name: _hyper_6_30_chunk_exchange_rate_time_idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_6_30_chunk_exchange_rate_time_idx ON _timescaledb_internal._hyper_6_30_chunk USING btree ("time" DESC);


--
-- Name: _hyper_6_31_chunk_exchange_rate_time_idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_6_31_chunk_exchange_rate_time_idx ON _timescaledb_internal._hyper_6_31_chunk USING btree ("time" DESC);


--
-- Name: _hyper_6_32_chunk_exchange_rate_time_idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_6_32_chunk_exchange_rate_time_idx ON _timescaledb_internal._hyper_6_32_chunk USING btree ("time" DESC);


--
-- Name: _hyper_6_33_chunk_exchange_rate_time_idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_6_33_chunk_exchange_rate_time_idx ON _timescaledb_internal._hyper_6_33_chunk USING btree ("time" DESC);


--
-- Name: _hyper_6_34_chunk_exchange_rate_time_idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_6_34_chunk_exchange_rate_time_idx ON _timescaledb_internal._hyper_6_34_chunk USING btree ("time" DESC);


--
-- Name: _hyper_6_35_chunk_exchange_rate_time_idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_6_35_chunk_exchange_rate_time_idx ON _timescaledb_internal._hyper_6_35_chunk USING btree ("time" DESC);


--
-- Name: _hyper_6_36_chunk_exchange_rate_time_idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_6_36_chunk_exchange_rate_time_idx ON _timescaledb_internal._hyper_6_36_chunk USING btree ("time" DESC);


--
-- Name: _hyper_6_37_chunk_exchange_rate_time_idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_6_37_chunk_exchange_rate_time_idx ON _timescaledb_internal._hyper_6_37_chunk USING btree ("time" DESC);


--
-- Name: _hyper_6_38_chunk_exchange_rate_time_idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_6_38_chunk_exchange_rate_time_idx ON _timescaledb_internal._hyper_6_38_chunk USING btree ("time" DESC);


--
-- Name: _hyper_6_39_chunk_exchange_rate_time_idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_6_39_chunk_exchange_rate_time_idx ON _timescaledb_internal._hyper_6_39_chunk USING btree ("time" DESC);


--
-- Name: _hyper_6_40_chunk_exchange_rate_time_idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_6_40_chunk_exchange_rate_time_idx ON _timescaledb_internal._hyper_6_40_chunk USING btree ("time" DESC);


--
-- Name: _hyper_6_41_chunk_exchange_rate_time_idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_6_41_chunk_exchange_rate_time_idx ON _timescaledb_internal._hyper_6_41_chunk USING btree ("time" DESC);


--
-- Name: _hyper_6_42_chunk_exchange_rate_time_idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_6_42_chunk_exchange_rate_time_idx ON _timescaledb_internal._hyper_6_42_chunk USING btree ("time" DESC);


--
-- Name: _hyper_6_43_chunk_exchange_rate_time_idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_6_43_chunk_exchange_rate_time_idx ON _timescaledb_internal._hyper_6_43_chunk USING btree ("time" DESC);


--
-- Name: _hyper_6_44_chunk_exchange_rate_time_idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_6_44_chunk_exchange_rate_time_idx ON _timescaledb_internal._hyper_6_44_chunk USING btree ("time" DESC);


--
-- Name: _hyper_6_45_chunk_exchange_rate_time_idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_6_45_chunk_exchange_rate_time_idx ON _timescaledb_internal._hyper_6_45_chunk USING btree ("time" DESC);


--
-- Name: _hyper_6_46_chunk_exchange_rate_time_idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_6_46_chunk_exchange_rate_time_idx ON _timescaledb_internal._hyper_6_46_chunk USING btree ("time" DESC);


--
-- Name: _hyper_6_47_chunk_exchange_rate_time_idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_6_47_chunk_exchange_rate_time_idx ON _timescaledb_internal._hyper_6_47_chunk USING btree ("time" DESC);


--
-- Name: _hyper_6_48_chunk_exchange_rate_time_idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_6_48_chunk_exchange_rate_time_idx ON _timescaledb_internal._hyper_6_48_chunk USING btree ("time" DESC);


--
-- Name: _hyper_6_49_chunk_exchange_rate_time_idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_6_49_chunk_exchange_rate_time_idx ON _timescaledb_internal._hyper_6_49_chunk USING btree ("time" DESC);


--
-- Name: _hyper_6_50_chunk_exchange_rate_time_idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_6_50_chunk_exchange_rate_time_idx ON _timescaledb_internal._hyper_6_50_chunk USING btree ("time" DESC);


--
-- Name: _hyper_6_51_chunk_exchange_rate_time_idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_6_51_chunk_exchange_rate_time_idx ON _timescaledb_internal._hyper_6_51_chunk USING btree ("time" DESC);


--
-- Name: _hyper_6_52_chunk_exchange_rate_time_idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_6_52_chunk_exchange_rate_time_idx ON _timescaledb_internal._hyper_6_52_chunk USING btree ("time" DESC);


--
-- Name: _hyper_6_53_chunk_exchange_rate_time_idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_6_53_chunk_exchange_rate_time_idx ON _timescaledb_internal._hyper_6_53_chunk USING btree ("time" DESC);


--
-- Name: _hyper_6_54_chunk_exchange_rate_time_idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_6_54_chunk_exchange_rate_time_idx ON _timescaledb_internal._hyper_6_54_chunk USING btree ("time" DESC);


--
-- Name: _hyper_6_55_chunk_exchange_rate_time_idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_6_55_chunk_exchange_rate_time_idx ON _timescaledb_internal._hyper_6_55_chunk USING btree ("time" DESC);


--
-- Name: _hyper_6_56_chunk_exchange_rate_time_idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_6_56_chunk_exchange_rate_time_idx ON _timescaledb_internal._hyper_6_56_chunk USING btree ("time" DESC);


--
-- Name: _hyper_6_57_chunk_exchange_rate_time_idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_6_57_chunk_exchange_rate_time_idx ON _timescaledb_internal._hyper_6_57_chunk USING btree ("time" DESC);


--
-- Name: _hyper_6_58_chunk_exchange_rate_time_idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_6_58_chunk_exchange_rate_time_idx ON _timescaledb_internal._hyper_6_58_chunk USING btree ("time" DESC);


--
-- Name: _hyper_6_59_chunk_exchange_rate_time_idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_6_59_chunk_exchange_rate_time_idx ON _timescaledb_internal._hyper_6_59_chunk USING btree ("time" DESC);


--
-- Name: _hyper_6_60_chunk_exchange_rate_time_idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_6_60_chunk_exchange_rate_time_idx ON _timescaledb_internal._hyper_6_60_chunk USING btree ("time" DESC);


--
-- Name: _hyper_6_8_chunk_exchange_rate_time_idx; Type: INDEX; Schema: _timescaledb_internal; Owner: -
--

CREATE INDEX _hyper_6_8_chunk_exchange_rate_time_idx ON _timescaledb_internal._hyper_6_8_chunk USING btree ("time" DESC);


--
-- Name: ix_advertising_cost_platforms_id; Type: INDEX; Schema: advertising_cost; Owner: -
--

CREATE UNIQUE INDEX ix_advertising_cost_platforms_id ON advertising_cost.platforms USING btree (id);


--
-- Name: ix_advertising_cost_platforms_uuid; Type: INDEX; Schema: advertising_cost; Owner: -
--

CREATE INDEX ix_advertising_cost_platforms_uuid ON advertising_cost.platforms USING btree (uuid);


--
-- Name: ix_bizflycrm_allocations_id; Type: INDEX; Schema: bizflycrm; Owner: -
--

CREATE UNIQUE INDEX ix_bizflycrm_allocations_id ON bizflycrm.allocations USING btree (id);


--
-- Name: ix_bizflycrm_calls_id; Type: INDEX; Schema: bizflycrm; Owner: -
--

CREATE UNIQUE INDEX ix_bizflycrm_calls_id ON bizflycrm.calls USING btree (id);


--
-- Name: ix_bizflycrm_customers_id; Type: INDEX; Schema: bizflycrm; Owner: -
--

CREATE UNIQUE INDEX ix_bizflycrm_customers_id ON bizflycrm.customers USING btree (id);


--
-- Name: ix_bizflycrm_departments_id; Type: INDEX; Schema: bizflycrm; Owner: -
--

CREATE UNIQUE INDEX ix_bizflycrm_departments_id ON bizflycrm.departments USING btree (id);


--
-- Name: ix_bizflycrm_kpis_id; Type: INDEX; Schema: bizflycrm; Owner: -
--

CREATE UNIQUE INDEX ix_bizflycrm_kpis_id ON bizflycrm.kpis USING btree (id);


--
-- Name: ix_bizflycrm_line_items_id; Type: INDEX; Schema: bizflycrm; Owner: -
--

CREATE UNIQUE INDEX ix_bizflycrm_line_items_id ON bizflycrm.line_items USING btree (id);


--
-- Name: ix_bizflycrm_orders_id; Type: INDEX; Schema: bizflycrm; Owner: -
--

CREATE UNIQUE INDEX ix_bizflycrm_orders_id ON bizflycrm.orders USING btree (id);


--
-- Name: ix_bizflycrm_orders_receipts_id; Type: INDEX; Schema: bizflycrm; Owner: -
--

CREATE UNIQUE INDEX ix_bizflycrm_orders_receipts_id ON bizflycrm.orders_receipts USING btree (id);


--
-- Name: ix_bizflycrm_payments_id; Type: INDEX; Schema: bizflycrm; Owner: -
--

CREATE UNIQUE INDEX ix_bizflycrm_payments_id ON bizflycrm.payments USING btree (id);


--
-- Name: ix_bizflycrm_promotions_id; Type: INDEX; Schema: bizflycrm; Owner: -
--

CREATE UNIQUE INDEX ix_bizflycrm_promotions_id ON bizflycrm.promotions USING btree (id);


--
-- Name: ix_bizflycrm_serial_numbers_id; Type: INDEX; Schema: bizflycrm; Owner: -
--

CREATE UNIQUE INDEX ix_bizflycrm_serial_numbers_id ON bizflycrm.serial_numbers USING btree (id);


--
-- Name: ix_bizflycrm_users_id; Type: INDEX; Schema: bizflycrm; Owner: -
--

CREATE UNIQUE INDEX ix_bizflycrm_users_id ON bizflycrm.users USING btree (id);


--
-- Name: ix_ecom_qr_generator_id; Type: INDEX; Schema: ecom; Owner: -
--

CREATE INDEX ix_ecom_qr_generator_id ON ecom.qr_generator USING btree (id);


--
-- Name: jewelry_diamond_pairing_unique_pairing; Type: INDEX; Schema: ecom; Owner: -
--

CREATE UNIQUE INDEX jewelry_diamond_pairing_unique_pairing ON ecom.jewelry_diamond_pairs USING btree (haravan_product_id, haravan_variant_id, haravan_diamond_product_id, haravan_diamond_variant_id);


--
-- Name: jewelry_diamond_pairs_haravan_diamond_product_id_haravan_di_idx; Type: INDEX; Schema: ecom; Owner: -
--

CREATE INDEX jewelry_diamond_pairs_haravan_diamond_product_id_haravan_di_idx ON ecom.jewelry_diamond_pairs USING btree (haravan_diamond_product_id, haravan_diamond_variant_id);


--
-- Name: jewelry_diamond_pairs_haravan_product_id_haravan_variant_id_idx; Type: INDEX; Schema: ecom; Owner: -
--

CREATE INDEX jewelry_diamond_pairs_haravan_product_id_haravan_variant_id_idx ON ecom.jewelry_diamond_pairs USING btree (haravan_product_id, haravan_variant_id, is_active);


--
-- Name: jewelry_diamond_pairs_id_idx; Type: INDEX; Schema: ecom; Owner: -
--

CREATE INDEX jewelry_diamond_pairs_id_idx ON ecom.jewelry_diamond_pairs USING btree (id);


--
-- Name: jewelry_diamond_pairs_id_key; Type: INDEX; Schema: ecom; Owner: -
--

CREATE UNIQUE INDEX jewelry_diamond_pairs_id_key ON ecom.jewelry_diamond_pairs USING btree (id);


--
-- Name: addresses_name_key; Type: INDEX; Schema: erpnext; Owner: -
--

CREATE UNIQUE INDEX addresses_name_key ON erpnext.addresses USING btree (name);


--
-- Name: contacts_name_idx; Type: INDEX; Schema: erpnext; Owner: -
--

CREATE INDEX contacts_name_idx ON erpnext.contacts USING btree (name);


--
-- Name: contacts_name_key; Type: INDEX; Schema: erpnext; Owner: -
--

CREATE UNIQUE INDEX contacts_name_key ON erpnext.contacts USING btree (name);


--
-- Name: customers_customer_name_idx; Type: INDEX; Schema: erpnext; Owner: -
--

CREATE INDEX customers_customer_name_idx ON erpnext.customers USING btree (customer_name);


--
-- Name: customers_haravan_id_idx; Type: INDEX; Schema: erpnext; Owner: -
--

CREATE INDEX customers_haravan_id_idx ON erpnext.customers USING btree (haravan_id);


--
-- Name: customers_name_idx; Type: INDEX; Schema: erpnext; Owner: -
--

CREATE INDEX customers_name_idx ON erpnext.customers USING btree (name);


--
-- Name: customers_name_key; Type: INDEX; Schema: erpnext; Owner: -
--

CREATE UNIQUE INDEX customers_name_key ON erpnext.customers USING btree (name);


--
-- Name: employees_name_key; Type: INDEX; Schema: erpnext; Owner: -
--

CREATE UNIQUE INDEX employees_name_key ON erpnext.employees USING btree (name);


--
-- Name: lead_budgets_name_idx; Type: INDEX; Schema: erpnext; Owner: -
--

CREATE INDEX lead_budgets_name_idx ON erpnext.lead_budgets USING btree (name);


--
-- Name: lead_budgets_name_key; Type: INDEX; Schema: erpnext; Owner: -
--

CREATE UNIQUE INDEX lead_budgets_name_key ON erpnext.lead_budgets USING btree (name);


--
-- Name: lead_demands_name_idx; Type: INDEX; Schema: erpnext; Owner: -
--

CREATE INDEX lead_demands_name_idx ON erpnext.lead_demands USING btree (name);


--
-- Name: lead_demands_name_key; Type: INDEX; Schema: erpnext; Owner: -
--

CREATE UNIQUE INDEX lead_demands_name_key ON erpnext.lead_demands USING btree (name);


--
-- Name: leads_name_idx; Type: INDEX; Schema: erpnext; Owner: -
--

CREATE INDEX leads_name_idx ON erpnext.leads USING btree (name);


--
-- Name: leads_name_key; Type: INDEX; Schema: erpnext; Owner: -
--

CREATE UNIQUE INDEX leads_name_key ON erpnext.leads USING btree (name);


--
-- Name: product_categories_name_idx; Type: INDEX; Schema: erpnext; Owner: -
--

CREATE INDEX product_categories_name_idx ON erpnext.product_categories USING btree (name);


--
-- Name: product_categories_name_key; Type: INDEX; Schema: erpnext; Owner: -
--

CREATE UNIQUE INDEX product_categories_name_key ON erpnext.product_categories USING btree (name);


--
-- Name: promotions_name_idx; Type: INDEX; Schema: erpnext; Owner: -
--

CREATE INDEX promotions_name_idx ON erpnext.promotions USING btree (name);


--
-- Name: promotions_name_key; Type: INDEX; Schema: erpnext; Owner: -
--

CREATE UNIQUE INDEX promotions_name_key ON erpnext.promotions USING btree (name);


--
-- Name: provinces_name_idx; Type: INDEX; Schema: erpnext; Owner: -
--

CREATE INDEX provinces_name_idx ON erpnext.provinces USING btree (name);


--
-- Name: provinces_name_key; Type: INDEX; Schema: erpnext; Owner: -
--

CREATE UNIQUE INDEX provinces_name_key ON erpnext.provinces USING btree (name);


--
-- Name: purchase_purposes_name_idx; Type: INDEX; Schema: erpnext; Owner: -
--

CREATE INDEX purchase_purposes_name_idx ON erpnext.purchase_purposes USING btree (name);


--
-- Name: purchase_purposes_name_key; Type: INDEX; Schema: erpnext; Owner: -
--

CREATE UNIQUE INDEX purchase_purposes_name_key ON erpnext.purchase_purposes USING btree (name);


--
-- Name: regions_name_idx; Type: INDEX; Schema: erpnext; Owner: -
--

CREATE INDEX regions_name_idx ON erpnext.regions USING btree (name);


--
-- Name: regions_name_key; Type: INDEX; Schema: erpnext; Owner: -
--

CREATE UNIQUE INDEX regions_name_key ON erpnext.regions USING btree (name);


--
-- Name: sales_order_notification_tracking_haravan_order_id_idx; Type: INDEX; Schema: erpnext; Owner: -
--

CREATE INDEX sales_order_notification_tracking_haravan_order_id_idx ON erpnext.sales_order_notification_tracking USING btree (haravan_order_id);


--
-- Name: sales_order_notification_tracking_order_name_idx; Type: INDEX; Schema: erpnext; Owner: -
--

CREATE INDEX sales_order_notification_tracking_order_name_idx ON erpnext.sales_order_notification_tracking USING btree (order_name);


--
-- Name: sales_orders_cancelled_status_idx; Type: INDEX; Schema: erpnext; Owner: -
--

CREATE INDEX sales_orders_cancelled_status_idx ON erpnext.sales_orders USING btree (cancelled_status);


--
-- Name: sales_orders_customer_idx; Type: INDEX; Schema: erpnext; Owner: -
--

CREATE INDEX sales_orders_customer_idx ON erpnext.sales_orders USING btree (customer);


--
-- Name: sales_orders_customer_transaction_date_idx; Type: INDEX; Schema: erpnext; Owner: -
--

CREATE INDEX sales_orders_customer_transaction_date_idx ON erpnext.sales_orders USING btree (customer, transaction_date);


--
-- Name: sales_orders_delivery_status_idx; Type: INDEX; Schema: erpnext; Owner: -
--

CREATE INDEX sales_orders_delivery_status_idx ON erpnext.sales_orders USING btree (delivery_status);


--
-- Name: sales_orders_financial_status_idx; Type: INDEX; Schema: erpnext; Owner: -
--

CREATE INDEX sales_orders_financial_status_idx ON erpnext.sales_orders USING btree (financial_status);


--
-- Name: sales_orders_fulfillment_status_idx; Type: INDEX; Schema: erpnext; Owner: -
--

CREATE INDEX sales_orders_fulfillment_status_idx ON erpnext.sales_orders USING btree (fulfillment_status);


--
-- Name: sales_orders_haravan_order_id_idx; Type: INDEX; Schema: erpnext; Owner: -
--

CREATE INDEX sales_orders_haravan_order_id_idx ON erpnext.sales_orders USING btree (haravan_order_id);


--
-- Name: sales_orders_name_key; Type: INDEX; Schema: erpnext; Owner: -
--

CREATE UNIQUE INDEX sales_orders_name_key ON erpnext.sales_orders USING btree (name);


--
-- Name: sales_orders_order_number_idx; Type: INDEX; Schema: erpnext; Owner: -
--

CREATE INDEX sales_orders_order_number_idx ON erpnext.sales_orders USING btree (order_number);


--
-- Name: sales_orders_status_idx; Type: INDEX; Schema: erpnext; Owner: -
--

CREATE INDEX sales_orders_status_idx ON erpnext.sales_orders USING btree (status);


--
-- Name: sales_persons_name_key; Type: INDEX; Schema: erpnext; Owner: -
--

CREATE UNIQUE INDEX sales_persons_name_key ON erpnext.sales_persons USING btree (name);


--
-- Name: users_name_key; Type: INDEX; Schema: erpnext; Owner: -
--

CREATE UNIQUE INDEX users_name_key ON erpnext.users USING btree (name);


--
-- Name: ix_haravan_collection_product_id; Type: INDEX; Schema: haravan; Owner: -
--

CREATE UNIQUE INDEX ix_haravan_collection_product_id ON haravan.collection_product USING btree (id);


--
-- Name: ix_haravan_collection_product_uuid; Type: INDEX; Schema: haravan; Owner: -
--

CREATE INDEX ix_haravan_collection_product_uuid ON haravan.collection_product USING btree (uuid);


--
-- Name: ix_haravan_custom_collections_id; Type: INDEX; Schema: haravan; Owner: -
--

CREATE UNIQUE INDEX ix_haravan_custom_collections_id ON haravan.custom_collections USING btree (id);


--
-- Name: ix_haravan_custom_collections_uuid; Type: INDEX; Schema: haravan; Owner: -
--

CREATE INDEX ix_haravan_custom_collections_uuid ON haravan.custom_collections USING btree (uuid);


--
-- Name: ix_haravan_customers_id; Type: INDEX; Schema: haravan; Owner: -
--

CREATE UNIQUE INDEX ix_haravan_customers_id ON haravan.customers USING btree (id);


--
-- Name: ix_haravan_customers_uuid; Type: INDEX; Schema: haravan; Owner: -
--

CREATE INDEX ix_haravan_customers_uuid ON haravan.customers USING btree (uuid);


--
-- Name: ix_haravan_fulfillments_id; Type: INDEX; Schema: haravan; Owner: -
--

CREATE UNIQUE INDEX ix_haravan_fulfillments_id ON haravan.fulfillments USING btree (id);


--
-- Name: ix_haravan_line_items_id; Type: INDEX; Schema: haravan; Owner: -
--

CREATE UNIQUE INDEX ix_haravan_line_items_id ON haravan.line_items USING btree (id);


--
-- Name: ix_haravan_orders_id; Type: INDEX; Schema: haravan; Owner: -
--

CREATE UNIQUE INDEX ix_haravan_orders_id ON haravan.orders USING btree (id);


--
-- Name: ix_haravan_products_id; Type: INDEX; Schema: haravan; Owner: -
--

CREATE UNIQUE INDEX ix_haravan_products_id ON haravan.products USING btree (id);


--
-- Name: ix_haravan_products_uuid; Type: INDEX; Schema: haravan; Owner: -
--

CREATE INDEX ix_haravan_products_uuid ON haravan.products USING btree (uuid);


--
-- Name: ix_haravan_purchase_receives_id; Type: INDEX; Schema: haravan; Owner: -
--

CREATE UNIQUE INDEX ix_haravan_purchase_receives_id ON haravan.purchase_receives USING btree (id);


--
-- Name: ix_haravan_purchase_receives_items_id; Type: INDEX; Schema: haravan; Owner: -
--

CREATE UNIQUE INDEX ix_haravan_purchase_receives_items_id ON haravan.purchase_receives_items USING btree (id);


--
-- Name: ix_haravan_purchase_receives_items_product_id; Type: INDEX; Schema: haravan; Owner: -
--

CREATE INDEX ix_haravan_purchase_receives_items_product_id ON haravan.purchase_receives_items USING btree (product_id);


--
-- Name: ix_haravan_purchase_receives_items_purchase_receive_id; Type: INDEX; Schema: haravan; Owner: -
--

CREATE INDEX ix_haravan_purchase_receives_items_purchase_receive_id ON haravan.purchase_receives_items USING btree (purchase_receive_id);


--
-- Name: ix_haravan_purchase_receives_items_uuid; Type: INDEX; Schema: haravan; Owner: -
--

CREATE INDEX ix_haravan_purchase_receives_items_uuid ON haravan.purchase_receives_items USING btree (uuid);


--
-- Name: ix_haravan_purchase_receives_uuid; Type: INDEX; Schema: haravan; Owner: -
--

CREATE INDEX ix_haravan_purchase_receives_uuid ON haravan.purchase_receives USING btree (uuid);


--
-- Name: ix_haravan_refunds_id; Type: INDEX; Schema: haravan; Owner: -
--

CREATE UNIQUE INDEX ix_haravan_refunds_id ON haravan.refunds USING btree (id);


--
-- Name: ix_haravan_transactions_id; Type: INDEX; Schema: haravan; Owner: -
--

CREATE UNIQUE INDEX ix_haravan_transactions_id ON haravan.transactions USING btree (id);


--
-- Name: ix_haravan_users_id; Type: INDEX; Schema: haravan; Owner: -
--

CREATE UNIQUE INDEX ix_haravan_users_id ON haravan.users USING btree (id);


--
-- Name: ix_haravan_users_uuid; Type: INDEX; Schema: haravan; Owner: -
--

CREATE INDEX ix_haravan_users_uuid ON haravan.users USING btree (uuid);


--
-- Name: ix_haravan_variants_id; Type: INDEX; Schema: haravan; Owner: -
--

CREATE UNIQUE INDEX ix_haravan_variants_id ON haravan.variants USING btree (id);


--
-- Name: ix_haravan_variants_product_id; Type: INDEX; Schema: haravan; Owner: -
--

CREATE INDEX ix_haravan_variants_product_id ON haravan.variants USING btree (product_id);


--
-- Name: ix_haravan_variants_uuid; Type: INDEX; Schema: haravan; Owner: -
--

CREATE INDEX ix_haravan_variants_uuid ON haravan.variants USING btree (uuid);


--
-- Name: ix_haravan_warehouse_inventories_id; Type: INDEX; Schema: haravan; Owner: -
--

CREATE UNIQUE INDEX ix_haravan_warehouse_inventories_id ON haravan.warehouse_inventories USING btree (id);


--
-- Name: ix_haravan_warehouse_inventories_uuid; Type: INDEX; Schema: haravan; Owner: -
--

CREATE INDEX ix_haravan_warehouse_inventories_uuid ON haravan.warehouse_inventories USING btree (uuid);


--
-- Name: inventory_check_lines_id_key; Type: INDEX; Schema: inventory_cms; Owner: -
--

CREATE UNIQUE INDEX inventory_check_lines_id_key ON inventory_cms.inventory_check_lines USING btree (id);


--
-- Name: inventory_check_sheets_id_key; Type: INDEX; Schema: inventory_cms; Owner: -
--

CREATE UNIQUE INDEX inventory_check_sheets_id_key ON inventory_cms.inventory_check_sheets USING btree (id);


--
-- Name: ix_larksuite_customer_appointments_id; Type: INDEX; Schema: larksuite; Owner: -
--

CREATE UNIQUE INDEX ix_larksuite_customer_appointments_id ON larksuite.customer_appointments USING btree (id);


--
-- Name: ix_larksuite_customer_appointments_uuid; Type: INDEX; Schema: larksuite; Owner: -
--

CREATE INDEX ix_larksuite_customer_appointments_uuid ON larksuite.customer_appointments USING btree (uuid);


--
-- Name: ix_larksuite_warehouse_inventories_lark_id; Type: INDEX; Schema: larksuite; Owner: -
--

CREATE UNIQUE INDEX ix_larksuite_warehouse_inventories_lark_id ON larksuite.lark_warehouse_inventories USING btree (id);


--
-- Name: records_record_id_key; Type: INDEX; Schema: larksuite; Owner: -
--

CREATE UNIQUE INDEX records_record_id_key ON larksuite.records USING btree (record_id);


--
-- Name: exchange_rate_time_idx; Type: INDEX; Schema: market_data; Owner: -
--

CREATE INDEX exchange_rate_time_idx ON market_data.exchange_rate USING btree ("time" DESC);


--
-- Name: gold_pricing_time_idx; Type: INDEX; Schema: market_data; Owner: -
--

CREATE INDEX gold_pricing_time_idx ON market_data.gold_pricing USING btree ("time" DESC);


--
-- Name: ix_misa_inventory_items_sku; Type: INDEX; Schema: misa; Owner: -
--

CREATE UNIQUE INDEX ix_misa_inventory_items_sku ON misa.inventory_items USING btree (sku);


--
-- Name: ix_misa_inventory_items_uuid; Type: INDEX; Schema: misa; Owner: -
--

CREATE INDEX ix_misa_inventory_items_uuid ON misa.inventory_items USING btree (uuid);


--
-- Name: ix_misa_items_id; Type: INDEX; Schema: misa; Owner: -
--

CREATE UNIQUE INDEX ix_misa_items_id ON misa.items USING btree (id);


--
-- Name: ix_misa_purchase_voucher_details_refid; Type: INDEX; Schema: misa; Owner: -
--

CREATE INDEX ix_misa_purchase_voucher_details_refid ON misa.purchase_voucher_details USING btree (refid);


--
-- Name: ix_misa_purchase_vouchers_refid; Type: INDEX; Schema: misa; Owner: -
--

CREATE UNIQUE INDEX ix_misa_purchase_vouchers_refid ON misa.purchase_vouchers USING btree (refid);


--
-- Name: users_employee_code_key; Type: INDEX; Schema: misa; Owner: -
--

CREATE UNIQUE INDEX users_employee_code_key ON misa.users USING btree (employee_code);


--
-- Name: users_haravan_id_key; Type: INDEX; Schema: misa; Owner: -
--

CREATE UNIQUE INDEX users_haravan_id_key ON misa.users USING btree (haravan_id);


--
-- Name: conversation_id_page_idx; Type: INDEX; Schema: pancake; Owner: -
--

CREATE UNIQUE INDEX conversation_id_page_idx ON pancake.conversation USING btree (id, page_id);


--
-- Name: idx_conversation_page_id; Type: INDEX; Schema: pancake; Owner: -
--

CREATE INDEX idx_conversation_page_id ON pancake.conversation USING btree (page_id);


--
-- Name: idx_id; Type: INDEX; Schema: pancake; Owner: -
--

CREATE INDEX idx_id ON pancake.conversation USING btree (id);


--
-- Name: idx_page_id; Type: INDEX; Schema: pancake; Owner: -
--

CREATE INDEX idx_page_id ON pancake.page USING btree (id);


--
-- Name: ix_pancake_conversation_id; Type: INDEX; Schema: pancake; Owner: -
--

CREATE UNIQUE INDEX ix_pancake_conversation_id ON pancake.conversation USING btree (id);


--
-- Name: ix_pancake_conversation_uuid; Type: INDEX; Schema: pancake; Owner: -
--

CREATE INDEX ix_pancake_conversation_uuid ON pancake.conversation USING btree (uuid);


--
-- Name: ix_pancake_page_customer_id; Type: INDEX; Schema: pancake; Owner: -
--

CREATE UNIQUE INDEX ix_pancake_page_customer_id ON pancake.page_customer USING btree (id);


--
-- Name: ix_pancake_page_customer_uuid; Type: INDEX; Schema: pancake; Owner: -
--

CREATE INDEX ix_pancake_page_customer_uuid ON pancake.page_customer USING btree (uuid);


--
-- Name: ix_pancake_page_id; Type: INDEX; Schema: pancake; Owner: -
--

CREATE UNIQUE INDEX ix_pancake_page_id ON pancake.page USING btree (id);


--
-- Name: ix_pancake_page_uuid; Type: INDEX; Schema: pancake; Owner: -
--

CREATE INDEX ix_pancake_page_uuid ON pancake.page USING btree (uuid);


--
-- Name: manual_payments_lark_record_id_key; Type: INDEX; Schema: payment; Owner: -
--

CREATE UNIQUE INDEX manual_payments_lark_record_id_key ON payment.manual_payments USING btree (lark_record_id);


--
-- Name: manual_payments_uuid_idx; Type: INDEX; Schema: payment; Owner: -
--

CREATE INDEX manual_payments_uuid_idx ON payment.manual_payments USING btree (uuid);


--
-- Name: ix_promotion_order_promotions_id; Type: INDEX; Schema: promotion; Owner: -
--

CREATE UNIQUE INDEX ix_promotion_order_promotions_id ON promotion.order_promotions USING btree (id);


--
-- Name: designs_collections_id_index; Type: INDEX; Schema: workplace; Owner: -
--

CREATE INDEX designs_collections_id_index ON workplace.designs USING btree (collections_id);


--
-- Name: fk_haravan_co_products_0_kxecf3y_; Type: INDEX; Schema: workplace; Owner: -
--

CREATE INDEX fk_haravan_co_products_0_kxecf3y_ ON workplace._nc_m2m_haravan_collect_products USING btree (haravan_collections_id);


--
-- Name: fk_haravan_co_products_tl93hnbjtq; Type: INDEX; Schema: workplace; Owner: -
--

CREATE INDEX fk_haravan_co_products_tl93hnbjtq ON workplace._nc_m2m_haravan_collect_products USING btree (products_id);


--
-- Name: fk_haravan_co_products_v88qytf5oz; Type: INDEX; Schema: workplace; Owner: -
--

CREATE INDEX fk_haravan_co_products_v88qytf5oz ON workplace.products USING btree (haravan_collections_id);


--
-- Name: idx_harvan_variant_id_workplace_variants; Type: INDEX; Schema: workplace; Owner: -
--

CREATE INDEX idx_harvan_variant_id_workplace_variants ON workplace.variants USING btree (haravan_variant_id);


--
-- Name: idx_variant_id_workplace_diamonds; Type: INDEX; Schema: workplace; Owner: -
--

CREATE INDEX idx_variant_id_workplace_diamonds ON workplace.diamonds USING btree (variant_id);


--
-- Name: products_order_idx; Type: INDEX; Schema: workplace; Owner: -
--

CREATE INDEX products_order_idx ON workplace.products USING btree (nc_order);


--
-- Name: unique_combination_constraint_design_code; Type: INDEX; Schema: workplace; Owner: -
--

CREATE UNIQUE INDEX unique_combination_constraint_design_code ON workplace.designs USING btree (design_type, gender, diamond_holder, source, design_year, design_seq, variant_number) WHERE ((design_type IS NOT NULL) AND (gender IS NOT NULL) AND (diamond_holder IS NOT NULL) AND (source IS NOT NULL) AND (design_year IS NOT NULL) AND (design_seq IS NOT NULL) AND (variant_number IS NOT NULL));


--
-- Name: unique_variant_id; Type: INDEX; Schema: workplace; Owner: -
--

CREATE UNIQUE INDEX unique_variant_id ON workplace.diamonds USING btree (variant_id);


--
-- Name: variant_serials_order_idx; Type: INDEX; Schema: workplace; Owner: -
--

CREATE INDEX variant_serials_order_idx ON workplace.variant_serials USING btree (nc_order);


--
-- Name: variants_order_idx; Type: INDEX; Schema: workplace; Owner: -
--

CREATE INDEX variants_order_idx ON workplace.variants USING btree (nc_order);


--
-- Name: exchange_rate ts_insert_blocker; Type: TRIGGER; Schema: market_data; Owner: -
--

CREATE TRIGGER ts_insert_blocker BEFORE INSERT ON market_data.exchange_rate FOR EACH ROW EXECUTE FUNCTION _timescaledb_functions.insert_blocker();


--
-- Name: gold_pricing ts_insert_blocker; Type: TRIGGER; Schema: market_data; Owner: -
--

CREATE TRIGGER ts_insert_blocker BEFORE INSERT ON market_data.gold_pricing FOR EACH ROW EXECUTE FUNCTION _timescaledb_functions.insert_blocker();


--
-- Name: conversation_embeddings conversation_embeddings; Type: TRIGGER; Schema: salesaya; Owner: -
--

CREATE TRIGGER conversation_embeddings BEFORE UPDATE ON salesaya.conversation_embeddings FOR EACH ROW EXECUTE FUNCTION salesaya.update_database_updated_at_column();


--
-- Name: customer_info set_timestamp; Type: TRIGGER; Schema: salesaya; Owner: -
--

CREATE TRIGGER set_timestamp BEFORE UPDATE ON salesaya.customer_info FOR EACH ROW EXECUTE FUNCTION salesaya.update_timestamp();


--
-- Name: embeddings set_updated_at_embeddings; Type: TRIGGER; Schema: salesaya; Owner: -
--

CREATE TRIGGER set_updated_at_embeddings BEFORE UPDATE ON salesaya.embeddings FOR EACH ROW EXECUTE FUNCTION salesaya.update_database_updated_at_column();


--
-- Name: jewelry_purchase_order_line_items set_db_update_at_trigger; Type: TRIGGER; Schema: supplychain; Owner: -
--

CREATE TRIGGER set_db_update_at_trigger BEFORE INSERT OR UPDATE ON supplychain.jewelry_purchase_order_line_items FOR EACH ROW EXECUTE FUNCTION supplychain.set_updated_at();


--
-- Name: designs trg_classify_melee_type; Type: TRIGGER; Schema: supplychain; Owner: -
--

CREATE TRIGGER trg_classify_melee_type AFTER UPDATE OF get_melee_status ON supplychain.designs FOR EACH ROW WHEN ((old.get_melee_status IS DISTINCT FROM new.get_melee_status)) EXECUTE FUNCTION supplychain.classify_melee_type();


--
-- Name: designs trg_melee_type_update; Type: TRIGGER; Schema: supplychain; Owner: -
--

CREATE TRIGGER trg_melee_type_update BEFORE UPDATE ON supplychain.designs FOR EACH ROW EXECUTE FUNCTION supplychain.trg_update_melee_type_timestamp();


--
-- Name: jewelry_purchase_orders trg_set_db_update_at; Type: TRIGGER; Schema: supplychain; Owner: -
--

CREATE TRIGGER trg_set_db_update_at BEFORE INSERT OR UPDATE ON supplychain.jewelry_purchase_orders FOR EACH ROW EXECUTE FUNCTION supplychain.set_updated_at();


--
-- Name: design_melee trg_set_updated_at; Type: TRIGGER; Schema: supplychain; Owner: -
--

CREATE TRIGGER trg_set_updated_at BEFORE UPDATE ON supplychain.design_melee FOR EACH ROW EXECUTE FUNCTION supplychain.set_database_updated_at();


--
-- Name: jewelry_purchase_order_line_items trg_update_hash_order_product_id; Type: TRIGGER; Schema: supplychain; Owner: -
--

CREATE TRIGGER trg_update_hash_order_product_id BEFORE INSERT OR UPDATE ON supplychain.jewelry_purchase_order_line_items FOR EACH ROW EXECUTE FUNCTION supplychain.update_jewelry_purchase_order_line_items_hash_order_product_id();


--
-- Name: jewelry_purchase_order_line_items trg_update_hash_sku_id; Type: TRIGGER; Schema: supplychain; Owner: -
--

CREATE TRIGGER trg_update_hash_sku_id BEFORE INSERT OR UPDATE ON supplychain.jewelry_purchase_order_line_items FOR EACH ROW EXECUTE FUNCTION supplychain.update_jewelry_purchase_order_line_items_hash_sku_id();


--
-- Name: designs trg_update_link_4view_timestamp; Type: TRIGGER; Schema: supplychain; Owner: -
--

CREATE TRIGGER trg_update_link_4view_timestamp BEFORE UPDATE ON supplychain.designs FOR EACH ROW WHEN ((old.link_4view IS DISTINCT FROM new.link_4view)) EXECUTE FUNCTION supplychain.update_link_4view_timestamp();


--
-- Name: diamond_attribute trigger_set_database_created_at; Type: TRIGGER; Schema: supplychain; Owner: -
--

CREATE TRIGGER trigger_set_database_created_at BEFORE INSERT ON supplychain.diamond_attribute FOR EACH ROW EXECUTE FUNCTION supplychain.set_database_created_at();


--
-- Name: diamond_attribute trigger_set_database_updated_at; Type: TRIGGER; Schema: supplychain; Owner: -
--

CREATE TRIGGER trigger_set_database_updated_at BEFORE UPDATE ON supplychain.diamond_attribute FOR EACH ROW EXECUTE FUNCTION supplychain.set_database_updated_at();


--
-- Name: jewelry_purchase_orders trigger_set_db_update_at; Type: TRIGGER; Schema: supplychain; Owner: -
--

CREATE TRIGGER trigger_set_db_update_at BEFORE INSERT OR UPDATE ON supplychain.jewelry_purchase_orders FOR EACH ROW EXECUTE FUNCTION supplychain.set_updated_at();


--
-- Name: jewelry_purchase_orders trigger_update_hash_record_id_jewelry_purchase_order; Type: TRIGGER; Schema: supplychain; Owner: -
--

CREATE TRIGGER trigger_update_hash_record_id_jewelry_purchase_order BEFORE UPDATE OF record_id ON supplychain.jewelry_purchase_orders FOR EACH ROW EXECUTE FUNCTION supplychain.update_jewelry_purchase_order_hash_record_id();


--
-- Name: submitted_codes check_codes_pattern; Type: TRIGGER; Schema: workplace; Owner: -
--

CREATE TRIGGER check_codes_pattern BEFORE INSERT OR UPDATE ON workplace.submitted_codes FOR EACH ROW EXECUTE FUNCTION workplace.validate_codes_pattern();


--
-- Name: designs prevent_archived_status_change; Type: TRIGGER; Schema: workplace; Owner: -
--

CREATE TRIGGER prevent_archived_status_change BEFORE UPDATE ON workplace.designs FOR EACH ROW EXECUTE FUNCTION workplace.prevent_archived_update();


--
-- Name: variants prevent_update_barcode; Type: TRIGGER; Schema: workplace; Owner: -
--

CREATE TRIGGER prevent_update_barcode BEFORE UPDATE ON workplace.variants FOR EACH ROW EXECUTE FUNCTION workplace.prevent_update_barcode();


--
-- Name: variant_serials prevent_update_final_encoded_barcode; Type: TRIGGER; Schema: workplace; Owner: -
--

CREATE TRIGGER prevent_update_final_encoded_barcode BEFORE UPDATE ON workplace.variant_serials FOR EACH ROW EXECUTE FUNCTION workplace.prevent_update_final_encoded_barcode();


--
-- Name: variants prevent_update_if_not_null_trigger; Type: TRIGGER; Schema: workplace; Owner: -
--

CREATE TRIGGER prevent_update_if_not_null_trigger BEFORE UPDATE ON workplace.variants FOR EACH ROW EXECUTE FUNCTION workplace.prevent_update_sku_attribtes();


--
-- Name: variant_serials prevent_update_serial_number; Type: TRIGGER; Schema: workplace; Owner: -
--

CREATE TRIGGER prevent_update_serial_number BEFORE UPDATE ON workplace.variant_serials FOR EACH ROW EXECUTE FUNCTION workplace.prevent_update_serial_number();


--
-- Name: variant_serials prevent_update_variant_id; Type: TRIGGER; Schema: workplace; Owner: -
--

CREATE TRIGGER prevent_update_variant_id BEFORE DELETE ON workplace.variant_serials FOR EACH ROW EXECUTE FUNCTION workplace.prevent_update_variant_id();


--
-- Name: temporary_products prevent_update_variant_serial_id_trigger; Type: TRIGGER; Schema: workplace; Owner: -
--

CREATE TRIGGER prevent_update_variant_serial_id_trigger BEFORE UPDATE ON workplace.temporary_products FOR EACH ROW EXECUTE FUNCTION workplace.prevent_update_variant_serial_id();


--
-- Name: design_images set_updated_at_design_images; Type: TRIGGER; Schema: workplace; Owner: -
--

CREATE TRIGGER set_updated_at_design_images BEFORE UPDATE ON workplace.design_images FOR EACH ROW EXECUTE FUNCTION workplace.update_database_updated_at_column();


--
-- Name: collections set_updated_at_workplace_collections; Type: TRIGGER; Schema: workplace; Owner: -
--

CREATE TRIGGER set_updated_at_workplace_collections BEFORE UPDATE ON workplace.collections FOR EACH ROW EXECUTE FUNCTION workplace.update_database_updated_at_column();


--
-- Name: designs set_updated_at_workplace_designs; Type: TRIGGER; Schema: workplace; Owner: -
--

CREATE TRIGGER set_updated_at_workplace_designs BEFORE UPDATE ON workplace.designs FOR EACH ROW EXECUTE FUNCTION workplace.update_database_updated_at_column();


--
-- Name: diamond_price_list set_updated_at_workplace_diamond_price_list; Type: TRIGGER; Schema: workplace; Owner: -
--

CREATE TRIGGER set_updated_at_workplace_diamond_price_list BEFORE UPDATE ON workplace.diamond_price_list FOR EACH ROW EXECUTE FUNCTION workplace.update_database_updated_at_column();


--
-- Name: diamonds set_updated_at_workplace_diamonds; Type: TRIGGER; Schema: workplace; Owner: -
--

CREATE TRIGGER set_updated_at_workplace_diamonds BEFORE UPDATE ON workplace.diamonds FOR EACH ROW EXECUTE FUNCTION workplace.update_database_updated_at_column();


--
-- Name: jewelries set_updated_at_workplace_jewelries; Type: TRIGGER; Schema: workplace; Owner: -
--

CREATE TRIGGER set_updated_at_workplace_jewelries BEFORE UPDATE ON workplace.jewelries FOR EACH ROW EXECUTE FUNCTION workplace.update_database_updated_at_column();


--
-- Name: products set_updated_at_workplace_products; Type: TRIGGER; Schema: workplace; Owner: -
--

CREATE TRIGGER set_updated_at_workplace_products BEFORE UPDATE ON workplace.products FOR EACH ROW EXECUTE FUNCTION workplace.update_database_updated_at_column();


--
-- Name: variant_serials set_updated_at_workplace_products; Type: TRIGGER; Schema: workplace; Owner: -
--

CREATE TRIGGER set_updated_at_workplace_products BEFORE UPDATE ON workplace.variant_serials FOR EACH ROW EXECUTE FUNCTION workplace.update_database_updated_at_column();


--
-- Name: variants set_updated_at_workplace_products; Type: TRIGGER; Schema: workplace; Owner: -
--

CREATE TRIGGER set_updated_at_workplace_products BEFORE UPDATE ON workplace.variants FOR EACH ROW EXECUTE FUNCTION workplace.update_database_updated_at_column();


--
-- Name: promotions set_updated_at_workplace_promotions; Type: TRIGGER; Schema: workplace; Owner: -
--

CREATE TRIGGER set_updated_at_workplace_promotions BEFORE UPDATE ON workplace.promotions FOR EACH ROW EXECUTE FUNCTION workplace.update_database_updated_at_column();


--
-- Name: size_details set_updated_at_workplace_size_details; Type: TRIGGER; Schema: workplace; Owner: -
--

CREATE TRIGGER set_updated_at_workplace_size_details BEFORE UPDATE ON workplace.size_details FOR EACH ROW EXECUTE FUNCTION workplace.update_database_updated_at_column();


--
-- Name: submitted_codes set_updated_at_workplace_submitted_codes; Type: TRIGGER; Schema: workplace; Owner: -
--

CREATE TRIGGER set_updated_at_workplace_submitted_codes BEFORE UPDATE ON workplace.submitted_codes FOR EACH ROW EXECUTE FUNCTION public.update_database_updated_at_column();


--
-- Name: designs trg_update_design_max_seq; Type: TRIGGER; Schema: workplace; Owner: -
--

CREATE TRIGGER trg_update_design_max_seq AFTER INSERT OR UPDATE OF design_year ON workplace.designs FOR EACH ROW EXECUTE FUNCTION workplace.update_design_max_seq();


--
-- Name: design_melee_details trg_update_melee_total_price; Type: TRIGGER; Schema: workplace; Owner: -
--

CREATE TRIGGER trg_update_melee_total_price AFTER INSERT OR UPDATE ON workplace.design_melee_details FOR EACH ROW EXECUTE FUNCTION workplace.update_total_price();


--
-- Name: variants trigger_prevent_product_id_update; Type: TRIGGER; Schema: workplace; Owner: -
--

CREATE TRIGGER trigger_prevent_product_id_update BEFORE UPDATE ON workplace.variants FOR EACH ROW EXECUTE FUNCTION public.prevent_product_id_update();


--
-- Name: variant_serials trigger_set_serial_number; Type: TRIGGER; Schema: workplace; Owner: -
--

CREATE TRIGGER trigger_set_serial_number BEFORE INSERT ON workplace.variant_serials FOR EACH ROW EXECUTE FUNCTION workplace.set_serial_number();


--
-- Name: qr_generator qr_generator_haravan_order_id_fkey; Type: FK CONSTRAINT; Schema: ecom; Owner: -
--

ALTER TABLE ONLY ecom.qr_generator
    ADD CONSTRAINT qr_generator_haravan_order_id_fkey FOREIGN KEY (haravan_order_id) REFERENCES haravan.orders(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: manual_payments manual_payments_haravan_order_id_fkey; Type: FK CONSTRAINT; Schema: payment; Owner: -
--

ALTER TABLE ONLY payment.manual_payments
    ADD CONSTRAINT manual_payments_haravan_order_id_fkey FOREIGN KEY (haravan_order_id) REFERENCES haravan.orders(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: jewelry_details fk_categories; Type: FK CONSTRAINT; Schema: salesaya; Owner: -
--

ALTER TABLE ONLY salesaya.jewelry_details
    ADD CONSTRAINT fk_categories FOREIGN KEY (jewelry_categories_id) REFERENCES salesaya.jewelry_categories(id);


--
-- Name: jewelry_details fk_diamond_clarity; Type: FK CONSTRAINT; Schema: salesaya; Owner: -
--

ALTER TABLE ONLY salesaya.jewelry_details
    ADD CONSTRAINT fk_diamond_clarity FOREIGN KEY (diamond_clarity_id) REFERENCES salesaya.diamond_clarities(id);


--
-- Name: jewelry_details fk_diamond_color; Type: FK CONSTRAINT; Schema: salesaya; Owner: -
--

ALTER TABLE ONLY salesaya.jewelry_details
    ADD CONSTRAINT fk_diamond_color FOREIGN KEY (diamond_color_id) REFERENCES salesaya.diamond_colors(id);


--
-- Name: jewelry_details fk_diamond_shape; Type: FK CONSTRAINT; Schema: salesaya; Owner: -
--

ALTER TABLE ONLY salesaya.jewelry_details
    ADD CONSTRAINT fk_diamond_shape FOREIGN KEY (diamond_shape_id) REFERENCES salesaya.diamond_shapes(id);


--
-- Name: jewelry_details fk_diamond_size; Type: FK CONSTRAINT; Schema: salesaya; Owner: -
--

ALTER TABLE ONLY salesaya.jewelry_details
    ADD CONSTRAINT fk_diamond_size FOREIGN KEY (diamond_size_id) REFERENCES salesaya.diamond_sizes(id);


--
-- Name: jewelry_details fk_gold_type; Type: FK CONSTRAINT; Schema: salesaya; Owner: -
--

ALTER TABLE ONLY salesaya.jewelry_details
    ADD CONSTRAINT fk_gold_type FOREIGN KEY (gold_type_id) REFERENCES salesaya.gold_types(id);


--
-- Name: jewelry_details fk_material; Type: FK CONSTRAINT; Schema: salesaya; Owner: -
--

ALTER TABLE ONLY salesaya.jewelry_details
    ADD CONSTRAINT fk_material FOREIGN KEY (material_id) REFERENCES salesaya.materials(id);


--
-- Name: jewelry_details fk_need; Type: FK CONSTRAINT; Schema: salesaya; Owner: -
--

ALTER TABLE ONLY salesaya.jewelry_details
    ADD CONSTRAINT fk_need FOREIGN KEY (need_id) REFERENCES salesaya.jewelry_needs(id);


--
-- Name: jewelry_details fk_opportunity; Type: FK CONSTRAINT; Schema: salesaya; Owner: -
--

ALTER TABLE ONLY salesaya.jewelry_details
    ADD CONSTRAINT fk_opportunity FOREIGN KEY (opportunity_id) REFERENCES salesaya.opportunities(id) ON DELETE CASCADE;


--
-- Name: jewelry_details fk_types; Type: FK CONSTRAINT; Schema: salesaya; Owner: -
--

ALTER TABLE ONLY salesaya.jewelry_details
    ADD CONSTRAINT fk_types FOREIGN KEY (jewelry_type_id) REFERENCES salesaya.jewelry_types(id);


--
-- Name: messages messages_conversations_fk; Type: FK CONSTRAINT; Schema: salesaya; Owner: -
--

ALTER TABLE ONLY salesaya.messages
    ADD CONSTRAINT messages_conversations_fk FOREIGN KEY (conversation_id) REFERENCES salesaya.conversations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: design_images design_images_design_id_fkey; Type: FK CONSTRAINT; Schema: workplace; Owner: -
--

ALTER TABLE ONLY workplace.design_images
    ADD CONSTRAINT design_images_design_id_fkey FOREIGN KEY (design_id) REFERENCES workplace.designs(id) ON DELETE RESTRICT;


--
-- Name: design_price_estimation design_price_estimation_design_id_fkey; Type: FK CONSTRAINT; Schema: workplace; Owner: -
--

ALTER TABLE ONLY workplace.design_price_estimation
    ADD CONSTRAINT design_price_estimation_design_id_fkey FOREIGN KEY (design_id) REFERENCES workplace.designs(id) ON DELETE RESTRICT;


--
-- Name: design_set design_set_design_id_fkey; Type: FK CONSTRAINT; Schema: workplace; Owner: -
--

ALTER TABLE ONLY workplace.design_set
    ADD CONSTRAINT design_set_design_id_fkey FOREIGN KEY (design_id) REFERENCES workplace.designs(id) ON DELETE RESTRICT;


--
-- Name: design_set design_set_set_id_fkey; Type: FK CONSTRAINT; Schema: workplace; Owner: -
--

ALTER TABLE ONLY workplace.design_set
    ADD CONSTRAINT design_set_set_id_fkey FOREIGN KEY (set_id) REFERENCES workplace.sets(id) ON DELETE RESTRICT;


--
-- Name: designs designs_wedding_ring_id_fkey; Type: FK CONSTRAINT; Schema: workplace; Owner: -
--

ALTER TABLE ONLY workplace.designs
    ADD CONSTRAINT designs_wedding_ring_id_fkey FOREIGN KEY (wedding_ring_id) REFERENCES workplace.wedding_rings(id) ON DELETE RESTRICT;


--
-- Name: diamonds diamonds_g1_collection_id_fkey; Type: FK CONSTRAINT; Schema: workplace; Owner: -
--

ALTER TABLE ONLY workplace.diamonds
    ADD CONSTRAINT diamonds_g1_collection_id_fkey FOREIGN KEY (g1_collection_id) REFERENCES workplace.haravan_collections(id) ON DELETE RESTRICT;


--
-- Name: ecom_360 ecom_360_product_id_fkey; Type: FK CONSTRAINT; Schema: workplace; Owner: -
--

ALTER TABLE ONLY workplace.ecom_360
    ADD CONSTRAINT ecom_360_product_id_fkey FOREIGN KEY (product_id) REFERENCES workplace.products(id) ON DELETE RESTRICT;


--
-- Name: ecom_old_products ecom_old_products_design_id_fkey; Type: FK CONSTRAINT; Schema: workplace; Owner: -
--

ALTER TABLE ONLY workplace.ecom_old_products
    ADD CONSTRAINT ecom_old_products_design_id_fkey FOREIGN KEY (design_id) REFERENCES workplace.designs(id) ON DELETE RESTRICT;


--
-- Name: designs fk_collection_designs_0ry69f9nc6; Type: FK CONSTRAINT; Schema: workplace; Owner: -
--

ALTER TABLE ONLY workplace.designs
    ADD CONSTRAINT fk_collection_designs_0ry69f9nc6 FOREIGN KEY (collections_id) REFERENCES workplace.collections(id);


--
-- Name: design_melee_details fk_design_detail; Type: FK CONSTRAINT; Schema: workplace; Owner: -
--

ALTER TABLE ONLY workplace.design_melee_details
    ADD CONSTRAINT fk_design_detail FOREIGN KEY (design_detail_id) REFERENCES workplace.design_details(id) ON DELETE RESTRICT;


--
-- Name: jewelries fk_designs; Type: FK CONSTRAINT; Schema: workplace; Owner: -
--

ALTER TABLE ONLY workplace.jewelries
    ADD CONSTRAINT fk_designs FOREIGN KEY (design_id) REFERENCES workplace.designs(id) ON DELETE SET NULL;


--
-- Name: _nc_m2m_haravan_collect_products fk_haravan_co_products_8v31fxenpy; Type: FK CONSTRAINT; Schema: workplace; Owner: -
--

ALTER TABLE ONLY workplace._nc_m2m_haravan_collect_products
    ADD CONSTRAINT fk_haravan_co_products_8v31fxenpy FOREIGN KEY (products_id) REFERENCES workplace.products(id);


--
-- Name: products fk_haravan_co_products_enlvmi264j; Type: FK CONSTRAINT; Schema: workplace; Owner: -
--

ALTER TABLE ONLY workplace.products
    ADD CONSTRAINT fk_haravan_co_products_enlvmi264j FOREIGN KEY (haravan_collections_id) REFERENCES workplace.haravan_collections(id);


--
-- Name: _nc_m2m_haravan_collect_products fk_haravan_co_products_q3phsaq_nx; Type: FK CONSTRAINT; Schema: workplace; Owner: -
--

ALTER TABLE ONLY workplace._nc_m2m_haravan_collect_products
    ADD CONSTRAINT fk_haravan_co_products_q3phsaq_nx FOREIGN KEY (haravan_collections_id) REFERENCES workplace.haravan_collections(id);


--
-- Name: size_details fk_jewelries; Type: FK CONSTRAINT; Schema: workplace; Owner: -
--

ALTER TABLE ONLY workplace.size_details
    ADD CONSTRAINT fk_jewelries FOREIGN KEY (jewelry_id) REFERENCES workplace.jewelries(id) ON DELETE SET NULL;


--
-- Name: products fk_product_design; Type: FK CONSTRAINT; Schema: workplace; Owner: -
--

ALTER TABLE ONLY workplace.products
    ADD CONSTRAINT fk_product_design FOREIGN KEY (design_id) REFERENCES workplace.designs(id) ON DELETE RESTRICT;


--
-- Name: jewelries fk_ring_pairs; Type: FK CONSTRAINT; Schema: workplace; Owner: -
--

ALTER TABLE ONLY workplace.jewelries
    ADD CONSTRAINT fk_ring_pairs FOREIGN KEY (ring_pair_id) REFERENCES workplace.jewelries(id) ON DELETE SET NULL;


--
-- Name: temporary_products fk_variant_serial; Type: FK CONSTRAINT; Schema: workplace; Owner: -
--

ALTER TABLE ONLY workplace.temporary_products
    ADD CONSTRAINT fk_variant_serial FOREIGN KEY (variant_serial_id) REFERENCES workplace.variant_serials(id);


--
-- Name: variants fk_variants_products; Type: FK CONSTRAINT; Schema: workplace; Owner: -
--

ALTER TABLE ONLY workplace.variants
    ADD CONSTRAINT fk_variants_products FOREIGN KEY (product_id) REFERENCES workplace.products(id) ON DELETE RESTRICT;


--
-- Name: variant_serials fk_variants_variant_serials; Type: FK CONSTRAINT; Schema: workplace; Owner: -
--

ALTER TABLE ONLY workplace.variant_serials
    ADD CONSTRAINT fk_variants_variant_serials FOREIGN KEY (variant_id) REFERENCES workplace.variants(id) ON DELETE RESTRICT;


--
-- Name: moissanite_serials moissanite_serials_moissanite_id_fkey; Type: FK CONSTRAINT; Schema: workplace; Owner: -
--

ALTER TABLE ONLY workplace.moissanite_serials
    ADD CONSTRAINT moissanite_serials_moissanite_id_fkey FOREIGN KEY (moissanite_id) REFERENCES workplace.moissanite(id) ON DELETE RESTRICT;


--
-- Name: temporary_products temporary_products_design_id_fkey; Type: FK CONSTRAINT; Schema: workplace; Owner: -
--

ALTER TABLE ONLY workplace.temporary_products
    ADD CONSTRAINT temporary_products_design_id_fkey FOREIGN KEY (design_id) REFERENCES workplace.designs(id) ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--
