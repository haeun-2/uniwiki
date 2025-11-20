--
-- PostgreSQL database dump
--

\restrict PHRDXjJwxRNbbacdMaqzBLFABaUckuqbz1oXCHyIEF1KqOt8unQy3IUycRa4kcx

-- Dumped from database version 14.19 (Ubuntu 14.19-0ubuntu0.22.04.1)
-- Dumped by pg_dump version 16.10

-- Started on 2025-11-20 09:21:41

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
-- TOC entry 3390 (class 0 OID 16779)
-- Dependencies: 220
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: d104
--

INSERT INTO public.categories VALUES (1, '학교');
INSERT INTO public.categories VALUES (2, '학과');
INSERT INTO public.categories VALUES (3, '강의');
INSERT INTO public.categories VALUES (4, '시설');
INSERT INTO public.categories VALUES (5, '행사');
INSERT INTO public.categories VALUES (6, '기타');


--
-- TOC entry 3384 (class 0 OID 16723)
-- Dependencies: 212
-- Data for Name: code_groups; Type: TABLE DATA; Schema: public; Owner: d104
--

INSERT INTO public.code_groups VALUES (1, 'DISCUSSION_STATUS', true);
INSERT INTO public.code_groups VALUES (2, 'DISCUSSION_REPORT_STATUS', true);
INSERT INTO public.code_groups VALUES (3, 'DISCUSSION_TYPE', true);
INSERT INTO public.code_groups VALUES (4, 'USER_REPORT_STATUS', true);
INSERT INTO public.code_groups VALUES (5, 'USER_ACTIVITY_TYPE', true);


--
-- TOC entry 3386 (class 0 OID 16731)
-- Dependencies: 214
-- Data for Name: codes; Type: TABLE DATA; Schema: public; Owner: d104
--

INSERT INTO public.codes VALUES (1, 1, 'OPEN', 1, true);
INSERT INTO public.codes VALUES (2, 1, 'PAUSE', 2, true);
INSERT INTO public.codes VALUES (3, 1, 'CLOSED', 3, true);
INSERT INTO public.codes VALUES (4, 2, 'PENDING', 1, true);
INSERT INTO public.codes VALUES (5, 2, 'REJECTED', 2, true);
INSERT INTO public.codes VALUES (6, 2, 'RESOLVED', 3, true);
INSERT INTO public.codes VALUES (7, 3, 'USER', 1, true);
INSERT INTO public.codes VALUES (8, 3, 'SYSTEM', 2, true);
INSERT INTO public.codes VALUES (9, 4, 'PENDING', 1, true);
INSERT INTO public.codes VALUES (10, 4, 'REJECTED', 2, true);
INSERT INTO public.codes VALUES (11, 4, 'RESOLVED', 3, true);
INSERT INTO public.codes VALUES (12, 5, 'CREATE_DOCUMENT', 1, true);
INSERT INTO public.codes VALUES (13, 5, 'EDIT_DOCUMENT', 2, true);
INSERT INTO public.codes VALUES (14, 5, 'CREATE_DISCUSSION', 3, true);
INSERT INTO public.codes VALUES (15, 5, 'REPLY_DISCUSSION', 4, true);


--
-- TOC entry 3382 (class 0 OID 16716)
-- Dependencies: 210
-- Data for Name: regions; Type: TABLE DATA; Schema: public; Owner: d104
--

INSERT INTO public.regions VALUES (1, '서울특별시');
INSERT INTO public.regions VALUES (2, '부산광역시');
INSERT INTO public.regions VALUES (3, '인천광역시');
INSERT INTO public.regions VALUES (4, '대전광역시');
INSERT INTO public.regions VALUES (5, '대구광역시');
INSERT INTO public.regions VALUES (6, '울산광역시');
INSERT INTO public.regions VALUES (7, '광주광역시');
INSERT INTO public.regions VALUES (8, '경기도');
INSERT INTO public.regions VALUES (9, '강원도');
INSERT INTO public.regions VALUES (10, '충청북도');
INSERT INTO public.regions VALUES (11, '충청남도');
INSERT INTO public.regions VALUES (12, '전북특별자치도');
INSERT INTO public.regions VALUES (13, '전라남도');
INSERT INTO public.regions VALUES (14, '경상북도');
INSERT INTO public.regions VALUES (15, '경상남도');
INSERT INTO public.regions VALUES (16, '제주도');
INSERT INTO public.regions VALUES (25, '세종특별자치시');


--
-- TOC entry 3388 (class 0 OID 16744)
-- Dependencies: 216
-- Data for Name: universities; Type: TABLE DATA; Schema: public; Owner: d104
--

INSERT INTO public.universities VALUES (18, '강서대학교', '서울특별시 강서구 까치산로24길 47 (화곡동, 케이씨대학교)', NULL, 'http://gangseo.ac.kr', 'gangseo.ac.kr', NULL, 1);
INSERT INTO public.universities VALUES (27, '경기과학기술대학교', '경기도 시흥시 경기과기대로 269 (정왕동, 경기과학기술대학교)', NULL, 'http://gtec.ac.kr', 'gtec.ac.kr', NULL, 8);
INSERT INTO public.universities VALUES (31, '경남도립남해대학', '경상남도 남해군 남해읍 화전로78번길 30 (남변리, 경남도립남해대학)', NULL, 'https://univ.namhae.ac.kr', 'univ.namhae.ac.kr', NULL, 15);
INSERT INTO public.universities VALUES (42, '경성대학교', '부산광역시 남구 수영로 309 (대연동, 경성대학교)', NULL, 'http://ks.ac.kr', 'ks.ac.kr', NULL, 2);
INSERT INTO public.universities VALUES (7, 'SPC식품과학대학', '서울특별시 동작구 신대방16다길 14 (신대방동)', NULL, 'https://www.spc.co.kr/careers/introduce', 'spc.co.kr', NULL, 1);
INSERT INTO public.universities VALUES (53, '고려대학교 세종캠퍼스', '세종특별자치시 세종로 2511 고려대학교 세종캠퍼스', NULL, 'http://sejong.korea.ac.kr', 'sejong.korea.ac.kr', NULL, 25);
INSERT INTO public.universities VALUES (83, '국제예술대학교', '서울특별시 강남구 도산대로30길 47 (논현동, 국제예술대학교)', NULL, 'http://kua.ac.kr/', 'kua.ac.kr', NULL, 1);
INSERT INTO public.universities VALUES (89, '기독간호대학교', '광주광역시 남구 백서로70번길 6 (양림동, 기독간호대학)', NULL, 'http://ccn.ac.kr', 'ccn.ac.kr', NULL, 7);
INSERT INTO public.universities VALUES (91, '김포대학교', '경기도 김포시 월곶면 김포대학로 97 (포내리, 김포대학교)', NULL, 'https://ukp.ac.kr', 'ukp.ac.kr', NULL, 8);
INSERT INTO public.universities VALUES (115, '대전가톨릭대학교', '세종특별자치시 전의면 가톨릭대학로 30 (신방리, 대전가톨릭대학교)', NULL, 'http://dcatholic.ac.kr', 'dcatholic.ac.kr', NULL, 25);
INSERT INTO public.universities VALUES (124, '동국대학교 WISE캠퍼스', '경북 경주시 동대로 123 동국대학교 WISE캠퍼스', NULL, 'http://web.dongguk.ac.kr', 'web.dongguk.ac.kr', NULL, 14);
INSERT INTO public.universities VALUES (140, '두원공과대학교', '경기도 안성시 죽산면 관음당길 51 (장원리, 두원공과대학교)', NULL, 'http://doowon.ac.kr', 'doowon.ac.kr', NULL, 8);
INSERT INTO public.universities VALUES (158, '부산과학기술대학교', '부산광역시 북구 시랑로132번길 88 (구포동, 부산과학기술대학교)', NULL, 'http://bist.ac.kr', 'bist.ac.kr', NULL, 2);
INSERT INTO public.universities VALUES (169, '삼성전자공과대학교', '경기 수원시 장안구 서부로 2066', NULL, 'http://ssit.ac.kr', 'ssit.ac.kr', NULL, 8);
INSERT INTO public.universities VALUES (176, '서라벌대학교', '경상북도 경주시 태종로 516 (충효동, 서라벌대학)', NULL, 'http://home.sorabol.ac.kr', 'home.sorabol.ac.kr', NULL, 14);
INSERT INTO public.universities VALUES (180, '서울기독대학교', '서울특별시 은평구 갈현로4길 26-2 (신사동, 서울기독대학교)', NULL, '', 'unknown', NULL, 1);
INSERT INTO public.universities VALUES (205, '세종사이버대학교', '서울특별시 광진구 군자로 121 (군자동, 세종사이버대학)', NULL, 'http://sjcu.ac.kr/', 'sjcu.ac.kr', NULL, 1);
INSERT INTO public.universities VALUES (213, '수원대학교', '경기도 화성시 봉담읍 와우안길 17 (와우리, 수원대학교)', NULL, 'http://suwon.ac.kr', 'suwon.ac.kr', NULL, 8);
INSERT INTO public.universities VALUES (219, '숭실대학교', '서울 동작구 상도로 369', NULL, 'http://ssu.ac.kr', 'ssu.ac.kr', NULL, 1);
INSERT INTO public.universities VALUES (287, '정석대학', '서울특별시 강서구 하늘길 260 (공항동, 대한항공)', NULL, '', 'unknown', NULL, 1);
INSERT INTO public.universities VALUES (298, '중앙승가대학교', '경기 김포시 승가로 123 (풍무동)', NULL, 'https://admission.sangha.ac.kr', 'admission.sangha.ac.kr', NULL, 8);
INSERT INTO public.universities VALUES (306, '청암대학교', '전라남도 순천시 녹색로 1641 (덕월동, 순천청암대학)', NULL, 'http://ca.ac.kr', 'ca.ac.kr', NULL, 13);
INSERT INTO public.universities VALUES (324, '포스코기술대학', '경상북도 포항시 남구 지곡로 120 (지곡동, 포스코인재개발원)', NULL, 'https://ptu.posco.co.kr:4443', 'ptu.posco.co.kr', NULL, 14);
INSERT INTO public.universities VALUES (332, '한국교원대학교', '충청북도 청주시 흥덕구 강내면 태성탑연로 250 (다락리, 한국교원대학교대학원)', NULL, '', 'unknown', NULL, 10);
INSERT INTO public.universities VALUES (347, '한국폴리텍 I 대학 서울강서캠퍼스', '서울특별시 강서구 우장산로10길 112 (화곡동, 한국폴리텍대학서울강서캠퍼스)', NULL, 'http://kangseo.kopo.ac.kr', 'kangseo.kopo.ac.kr', NULL, 1);
INSERT INTO public.universities VALUES (348, '한국폴리텍 I 대학 서울정수캠퍼스', '서울특별시 용산구 보광로 73 (보광동, 한국폴리텍1대학서울정수캠퍼스)', NULL, 'http://jungsu.kopo.ac.kr', 'jungsu.kopo.ac.kr', NULL, 1);
INSERT INTO public.universities VALUES (362, '한국폴리텍 V 대학 순천캠퍼스', '전라남도 순천시 기적의도서관1길 41 (조례동, 한국폴리텍대학순천캠퍼스)', NULL, 'http://kopo.ac.kr/suncheon', 'kopo.ac.kr', NULL, 13);
INSERT INTO public.universities VALUES (363, '한국폴리텍 V 대학 익산캠퍼스', '전북 익산시 선화로 579', NULL, 'http://iksan.kopo.ac.kr', 'iksan.kopo.ac.kr', NULL, 12);
INSERT INTO public.universities VALUES (366, '한국폴리텍 VI 대학 구미캠퍼스', '경북 구미시 수출대로3길 84(공단동, 한국폴리텍대학구미캠퍼스)', NULL, '', 'unknown', NULL, 14);
INSERT INTO public.universities VALUES (368, '한국폴리텍 VI 대학 영남융합기술캠퍼스', '대구광역시 동구 팔공로 222 (봉무동)', NULL, 'http://kopo.ac.kr/yct', 'kopo.ac.kr', NULL, 5);
INSERT INTO public.universities VALUES (373, '한국폴리텍 VII 대학 진주캠퍼스', '경상남도 진주시 모덕로 299 (하대동, 한국폴리텍대학7캠퍼스)', NULL, '', 'unknown', NULL, 15);
INSERT INTO public.universities VALUES (376, '한국폴리텍 특성화대학 바이오캠퍼스', '충청남도 논산시 강경읍 동안로112번길 48 (채운리, 한국폴리텍바이오대학)', NULL, 'http://kopo.ac.kr/bio', 'kopo.ac.kr', NULL, 11);
INSERT INTO public.universities VALUES (8, '가야대학교', '경상남도 김해시 삼계로 208 (삼계동)', NULL, 'http://www.kaya.ac.kr/main/kaya_main.aspx', 'kaya.ac.kr', NULL, 15);
INSERT INTO public.universities VALUES (9, '가천대학교', '경기도 성남시 수정구 성남대로 1342 (복정동, 가천대학교)', NULL, 'http://www.gachon.ac.kr', 'gachon.ac.kr', NULL, 8);
INSERT INTO public.universities VALUES (11, '가톨릭꽃동네대학교', '충청북도 청주시 서원구 현도면 상삼길 133 (상삼리, 가톨릭꽃동네대학교)', NULL, 'http://www.kkot.ac.kr', 'kkot.ac.kr', NULL, 10);
INSERT INTO public.universities VALUES (12, '가톨릭대학교', '경기도 부천시 원미구 지봉로 43 (역곡동, 가톨릭대학교성심교정)', NULL, 'http://www.catholic.ac.kr', 'catholic.ac.kr', NULL, 8);
INSERT INTO public.universities VALUES (13, '가톨릭상지대학교', '경상북도 안동시 상지길 45 (율세동, 가톨릭상지대학교)', NULL, 'http://www.csj.ac.kr', 'csj.ac.kr', NULL, 14);
INSERT INTO public.universities VALUES (14, '감리교신학대학교', '서울특별시 서대문구 독립문로 56 (냉천동, 감리교신학대학)', NULL, 'http://www.mtu.ac.kr', 'mtu.ac.kr', NULL, 1);
INSERT INTO public.universities VALUES (15, '강남대학교', '경기도 용인시 기흥구 강남로 40 (구갈동, 강남대학교)', NULL, 'http://www.kangnam.ac.kr', 'kangnam.ac.kr', NULL, 8);
INSERT INTO public.universities VALUES (16, '강동대학교', '충청북도 음성군 감곡면 대학길 278 (단평리, 강동대학교)', NULL, 'http://www.gangdong.ac.kr', 'gangdong.ac.kr', NULL, 10);
INSERT INTO public.universities VALUES (6, 'LH토지주택대학교', '대전광역시 유성구 엑스포로539번길 99 (전민동, LH토지주택연구원)', NULL, 'https://lhu.lh.or.kr', 'lhu.lh.or.kr', 'https://uniwiki-bucket.s3.ap-northeast-2.amazonaws.com/uni-logo/LH%ED%86%A0%EC%A7%80%EC%A3%BC%ED%83%9D%EB%8C%80%ED%95%99%EA%B5%90.png', 4);
INSERT INTO public.universities VALUES (22, '거제대학교', '경상남도 거제시 마전1길 91 (장승포동, 거제대학)', NULL, 'http://www.koje.ac.kr', 'koje.ac.kr', NULL, 15);
INSERT INTO public.universities VALUES (23, '건국대학교', '서울특별시 광진구 능동로 120 (화양동, 건국대학교)', NULL, 'http://www.konkuk.ac.kr', 'konkuk.ac.kr', NULL, 1);
INSERT INTO public.universities VALUES (24, '건국대학교 글로컬캠퍼스', '충청북도 충주시 충원대로 268 (단월동, 건국대학교GLOCAL캠퍼스)', NULL, 'http://www.kku.ac.kr', 'kku.ac.kr', NULL, 10);
INSERT INTO public.universities VALUES (25, '건양대학교', '충청남도 논산시 대학로 121 (내동, 건양대학교)', NULL, 'http://www.konyang.ac.kr', 'konyang.ac.kr', NULL, 11);
INSERT INTO public.universities VALUES (26, '건양사이버대학교', '대전광역시 서구 관저동로 158 (관저동, 건양사이버대학교)', NULL, 'http://www.kycu.ac.kr', 'kycu.ac.kr', NULL, 4);
INSERT INTO public.universities VALUES (28, '경기대학교', '경기도 수원시 영통구 광교산로 154-42 (이의동, 경기대학교)', NULL, 'http://www.kyonggi.ac.kr', 'kyonggi.ac.kr', NULL, 8);
INSERT INTO public.universities VALUES (30, '경남도립거창대학', '경상남도 거창군 거창읍 거창대학로 72 (대평리, 경남도립거창대학)', NULL, 'http://www.gc.ac.kr', 'gc.ac.kr', NULL, 15);
INSERT INTO public.universities VALUES (32, '경남정보대학교', '부산광역시 사상구 주례로 45 (주례동, 경남정보대학)', NULL, 'http://www.kit.ac.kr', 'kit.ac.kr', NULL, 2);
INSERT INTO public.universities VALUES (34, '경민대학교', '경기도 의정부시 서부로 545 (가능동, 경민대학)', NULL, 'http://www.kyungmin.ac.kr', 'kyungmin.ac.kr', NULL, 8);
INSERT INTO public.universities VALUES (35, '경복대학교', '경기도 남양주시 진접읍 경복대로 425 (금곡리, 경복대학교)', NULL, 'http://www.kbu.ac.kr', 'kbu.ac.kr', NULL, 8);
INSERT INTO public.universities VALUES (36, '경북과학대학교', '경상북도 칠곡군 기산면 지산로 634 (봉산리, 경북과학대학교)', NULL, 'http://www.kbsc.ac.kr', 'kbsc.ac.kr', NULL, 14);
INSERT INTO public.universities VALUES (38, '경북도립대학교', '경상북도 예천군 예천읍 도립대학길 114 (청복리, 경북도립대학교)', NULL, 'http://www.gpc.ac.kr', 'gpc.ac.kr', NULL, 14);
INSERT INTO public.universities VALUES (39, '경북보건대학교', '경상북도 김천시 대학로 168 (삼락동, 경북보건대학교)', NULL, 'http://www.gch.ac.kr', 'gch.ac.kr', NULL, 14);
INSERT INTO public.universities VALUES (40, '경북전문대학교', '경상북도 영주시 대학로 77 (휴천동, 경북전문대학교)', NULL, 'http://www.kbc.ac.kr', 'kbc.ac.kr', NULL, 14);
INSERT INTO public.universities VALUES (41, '경상국립대학교', '경상남도 진주시 진주대로 501 (가좌동, 경상국립대학교가좌캠퍼스)', NULL, 'https://www.gnu.ac.kr/main/main.do', 'gnu.ac.kr', NULL, 15);
INSERT INTO public.universities VALUES (43, '경운대학교', '경상북도 구미시 산동면 강동로 730 (인덕리, 경운대학교)', NULL, 'http://www.ikw.ac.kr', 'ikw.ac.kr', NULL, 14);
INSERT INTO public.universities VALUES (44, '경인교육대학교', '인천광역시 계양구 계산로 62 (계산동, 경인교육대학교)', NULL, 'http://www.ginue.ac.kr', 'ginue.ac.kr', NULL, 3);
INSERT INTO public.universities VALUES (45, '경인여자대학교', '인천광역시 계양구 계양산로 63 (계산동, 경인여자대학)', NULL, 'http://www.kiwu.ac.kr', 'kiwu.ac.kr', NULL, 3);
INSERT INTO public.universities VALUES (47, '경희대학교', '서울특별시 동대문구 경희대로 26 (회기동, 경희대학교)', NULL, 'http://www.khu.ac.kr', 'khu.ac.kr', NULL, 1);
INSERT INTO public.universities VALUES (48, '경희사이버대학교', '서울특별시 동대문구 경희대로 26 (회기동, 경희사이버대학교)', NULL, 'http://www.khcu.ac.kr', 'khcu.ac.kr', NULL, 1);
INSERT INTO public.universities VALUES (49, '계명대학교', '대구광역시 달서구 달구벌대로 1095 (신당동, 계명대학교성서캠퍼스)', NULL, 'http://www.kmu.ac.kr', 'kmu.ac.kr', NULL, 5);
INSERT INTO public.universities VALUES (50, '계명문화대학교', '대구광역시 달서구 달서대로 675 (신당동, 계명문화대학교)', NULL, 'http://www.kmcu.ac.kr', 'kmcu.ac.kr', NULL, 5);
INSERT INTO public.universities VALUES (51, '계원예술대학교', '경기도 의왕시 계원대학로 66 (내손동, 계원예술대학교)', NULL, 'http://www.kaywon.ac.kr', 'kaywon.ac.kr', NULL, 8);
INSERT INTO public.universities VALUES (54, '고려사이버대학교', '서울특별시 종로구 북촌로 106 (계동, 고려사이버대학교)', NULL, 'http://www.cuk.edu', 'cuk.edu', NULL, 1);
INSERT INTO public.universities VALUES (55, '고신대학교', '부산광역시 영도구 와치로 194 (동삼동, 고신대학교)', NULL, 'http://www.kosin.ac.kr', 'kosin.ac.kr', NULL, 2);
INSERT INTO public.universities VALUES (56, '공주교육대학교', '충청남도 공주시 웅진로 27 (봉황동, 공주교육대학교)', NULL, 'http://www.gjue.ac.kr', 'gjue.ac.kr', NULL, 11);
INSERT INTO public.universities VALUES (57, '광신대학교', '광주광역시 북구 양산택지소로 36 (본촌동, 광신대학교)', NULL, 'http://www.kwangshin.ac.kr', 'kwangshin.ac.kr', NULL, 7);
INSERT INTO public.universities VALUES (58, '광양보건대학교', '전라남도 광양시 광양읍 대학로 85 (덕례리, 광양보건대학)', NULL, 'http://www.gy.ac.kr', 'gy.ac.kr', NULL, 13);
INSERT INTO public.universities VALUES (59, '광운대학교', '서울특별시 노원구 광운로 20 (월계동, 광운대학교)', NULL, 'http://www.kw.ac.kr', 'kw.ac.kr', NULL, 1);
INSERT INTO public.universities VALUES (60, '광주가톨릭대학교', '전라남도 나주시 남평읍 중남길 12-25 (남석리, 광주가톨릭대학교)', NULL, 'http://www.gjcatholic.ac.kr', 'gjcatholic.ac.kr', NULL, 13);
INSERT INTO public.universities VALUES (61, '광주과학기술원', '광주광역시 북구 첨단과기로 123 (오룡동, 광주과학기술원)', NULL, 'http://www.gist.ac.kr', 'gist.ac.kr', NULL, 7);
INSERT INTO public.universities VALUES (62, '광주교육대학교', '광주광역시 북구 필문대로 55 (풍향동, 광주교육대학교)', NULL, 'http://www.gnue.ac.kr', 'gnue.ac.kr', NULL, 7);
INSERT INTO public.universities VALUES (63, '광주대학교', '광주광역시 남구 효덕로 277 (진월동, 광주대학교)', NULL, 'http://www.gwangju.ac.kr', 'gwangju.ac.kr', NULL, 7);
INSERT INTO public.universities VALUES (64, '광주보건대학교', '광주광역시 광산구 북문대로419번길 73 (신창동, 광주보건대학)', NULL, 'http://www.ghu.ac.kr', 'ghu.ac.kr', NULL, 7);
INSERT INTO public.universities VALUES (65, '광주여자대학교', '광주광역시 광산구 광주여대길 40 (산정동, 광주여자대학교도서관/대학본부)', NULL, 'http://www.kwu.ac.kr', 'kwu.ac.kr', NULL, 7);
INSERT INTO public.universities VALUES (66, '구미대학교', '경상북도 구미시 야은로 37 (부곡동, 구미대학교)', NULL, 'http://www.gumi.ac.kr', 'gumi.ac.kr', NULL, 14);
INSERT INTO public.universities VALUES (68, '국립공주대학교', '충청남도 공주시 공주대학로 56 (신관동, 공주대학교)', NULL, 'https://www.kongju.ac.kr/', 'kongju.ac.kr', NULL, 11);
INSERT INTO public.universities VALUES (69, '국립군산대학교', '전라북도 군산시 대학로 558 (미룡동, 군산대학교)', NULL, 'http://www.kunsan.ac.kr/index.kunsan', 'kunsan.ac.kr', NULL, 12);
INSERT INTO public.universities VALUES (71, '국립목포대학교', '전라남도 무안군 청계면 영산로 1666 (도림리, 목포대학교)', NULL, 'http://www.mokpo.ac.kr', 'mokpo.ac.kr', NULL, 13);
INSERT INTO public.universities VALUES (70, '국립금오공과대학교', '경상북도 구미시 대학로 61 (양호동, 금오공과대학교)', NULL, 'http://www.kumoh.ac.kr', 'kumoh.ac.kr', 'https://uniwiki-bucket.s3.ap-northeast-2.amazonaws.com/uni-logo/%EA%B8%88%EC%98%A4%EA%B3%B5%EA%B3%BC%EB%8C%80%ED%95%99%EA%B5%90.png', 14);
INSERT INTO public.universities VALUES (37, '경북대학교', '대구광역시 북구 대학로 80 (산격동, 경북대학교)', NULL, 'http://www.knu.ac.kr', 'knu.ac.kr', 'https://uniwiki-bucket.s3.ap-northeast-2.amazonaws.com/uni-logo/%EA%B2%BD%EB%B6%81%EB%8C%80%ED%95%99%EA%B5%90.png', 5);
INSERT INTO public.universities VALUES (52, '고려대학교', '서울특별시 성북구 안암로 145 (안암동5가, 고려대학교안암캠퍼스(인문사회계))', NULL, 'http://www.korea.ac.kr', 'korea.ac.kr', 'https://uniwiki-bucket.s3.ap-northeast-2.amazonaws.com/uni-logo/%EA%B3%A0%EB%A0%A4%EB%8C%80%ED%95%99%EA%B5%90.png', 1);
INSERT INTO public.universities VALUES (29, '경남대학교', '경상남도 창원시 마산합포구 경남대학로 7 (월영동, 경남대학교)', NULL, 'http://www.kyungnam.ac.kr', 'hanma.kr', NULL, 15);
INSERT INTO public.universities VALUES (46, '경일대학교', '경상북도 경산시 하양읍 가마실길 50 (부호리, 경일대학교)', NULL, 'http://www.kiu.ac.kr', 'kiu.kr', NULL, 14);
INSERT INTO public.universities VALUES (72, '국립목포해양대학교', '전라남도 목포시 해양대학로 91 (죽교동, 해양대학교)', NULL, 'http://www.mmu.ac.kr', 'mmu.ac.kr', NULL, 13);
INSERT INTO public.universities VALUES (73, '국립부경대학교', '부산광역시 남구 용소로 45 (대연동, 부경대학교대연캠퍼스)', NULL, 'http://www.pknu.ac.kr', 'pknu.ac.kr', NULL, 2);
INSERT INTO public.universities VALUES (74, '국립순천대학교', '전라남도 순천시 중앙로 255 (석현동, 순천대학교)', NULL, 'http://www.sunchon.ac.kr', 'sunchon.ac.kr', NULL, 13);
INSERT INTO public.universities VALUES (75, '국립안동대학교', '경상북도 안동시 경동로 1375 (송천동, 국립안동대학교)', NULL, 'http://www.andong.ac.kr', 'andong.ac.kr', NULL, 14);
INSERT INTO public.universities VALUES (76, '국립창원대학교', '경상남도 창원시 의창구 창원대학로 20 (사림동, 창원대학교)', NULL, 'http://www.changwon.ac.kr', 'changwon.ac.kr', NULL, 15);
INSERT INTO public.universities VALUES (77, '국립한국교통대학교', '충청북도 충주시 대소원면 대학로 50 (검단리, 한국교통대학교)', NULL, 'http://www.ut.ac.kr', 'ut.ac.kr', NULL, 10);
INSERT INTO public.universities VALUES (78, '국립한국해양대학교', '부산광역시 영도구 태종로 727 (동삼동, 한국해양대학교)', NULL, 'http://www.kmou.ac.kr/kmou/main.do', 'kmou.ac.kr', NULL, 2);
INSERT INTO public.universities VALUES (79, '국립한밭대학교', '대전광역시 유성구 동서대로 125 (덕명동, 한밭대학교)', NULL, 'http://www.hanbat.ac.kr', 'hanbat.ac.kr', NULL, 4);
INSERT INTO public.universities VALUES (80, '국민대학교', '서울특별시 성북구 정릉로 77 (정릉동, 국민대학교)', NULL, 'http://www.kookmin.ac.kr', 'kookmin.ac.kr', NULL, 1);
INSERT INTO public.universities VALUES (81, '국제대학교', '경기도 평택시 장안웃길 56 (장안동, 국제대학교)', NULL, 'http://www.kookje.ac.kr', 'kookje.ac.kr', NULL, 8);
INSERT INTO public.universities VALUES (84, '군산간호대학교', '전라북도 군산시 동개정길 7 (개정동, 군산간호대학교)', NULL, 'http://www.kcn.ac.kr', 'kcn.ac.kr', NULL, 12);
INSERT INTO public.universities VALUES (85, '군장대학교', '전라북도 군산시 성산면 군장대길 13 (도암리, 군장대학)', NULL, 'http://www.kunjang.ac.kr', 'kunjang.ac.kr', NULL, 12);
INSERT INTO public.universities VALUES (86, '극동대학교', '충청북도 음성군 감곡면 대학길 76-32 (왕장리, 극동대학교)', NULL, 'http://www.kdu.ac.kr', 'kdu.ac.kr', NULL, 10);
INSERT INTO public.universities VALUES (87, '글로벌사이버대학교', '충남 천안시 동남구 목천읍 교천지산길 284-88', NULL, 'http://www.global.ac.kr', 'global.ac.kr', NULL, 11);
INSERT INTO public.universities VALUES (88, '금강대학교', '충청남도 논산시 상월면 상월로 522 (대명리, 금강대학교)', NULL, 'http://www.ggu.ac.kr', 'ggu.ac.kr', NULL, 11);
INSERT INTO public.universities VALUES (90, '김천대학교', '경상북도 김천시 대학로 214 (삼락동, 김천대학교)', NULL, 'http://www.gimcheon.ac.kr', 'gimcheon.ac.kr', NULL, 14);
INSERT INTO public.universities VALUES (92, '김해대학교', '경상남도 김해시 삼안로112번길 198 (삼방동, 김해대학교)', NULL, 'http://www.gimhae.ac.kr', 'gimhae.ac.kr', NULL, 15);
INSERT INTO public.universities VALUES (93, '나사렛대학교', '충청남도 천안시 서북구 월봉로 48 (쌍용동, 나사렛대학교)', NULL, 'http://www.kornu.ac.kr', 'kornu.ac.kr', NULL, 11);
INSERT INTO public.universities VALUES (94, '나주대학교', '전라남도 나주시 다시면 백호로 125 (복암리, 고구려대학)', NULL, 'http://www.kgrc.ac.kr', 'kgrc.ac.kr', NULL, 13);
INSERT INTO public.universities VALUES (95, '남부대학교', '광주광역시 광산구 남부대길 1 (월계동, 삼애관)', NULL, 'http://www.nambu.ac.kr', 'nambu.ac.kr', NULL, 7);
INSERT INTO public.universities VALUES (96, '남서울대학교', '충청남도 천안시 서북구 성환읍 대학로 91 (매주리, 남서울대학교)', NULL, 'http://www.nsu.ac.kr', 'nsu.ac.kr', NULL, 11);
INSERT INTO public.universities VALUES (97, '농협대학교', '경기도 고양시 덕양구 서삼릉길 281 (원당동, 농협대학)', NULL, 'http://www.nonghyup.ac.kr', 'nonghyup.ac.kr', NULL, 8);
INSERT INTO public.universities VALUES (98, '단국대학교', '경기도 용인시 수지구 죽전로 152 (죽전동, 단국대학교죽전캠퍼스)', NULL, 'http://www.dankook.ac.kr', 'dankook.ac.kr', NULL, 8);
INSERT INTO public.universities VALUES (99, '대경대학교', '경상북도 경산시 자인면 단북1길 65 (단북리, 대경대학)', NULL, 'http://www.tk.ac.kr', 'tk.ac.kr', NULL, 14);
INSERT INTO public.universities VALUES (100, '대구가톨릭대학교', '경상북도 경산시 하양읍 하양로 13-13 (금락리, 대구가톨릭대학교)', NULL, 'http://www.cu.ac.kr/', 'cu.ac.kr', NULL, 14);
INSERT INTO public.universities VALUES (101, '대구경북과학기술원', '대구광역시 달성군 현풍면 테크노중앙대로 333 (상리)', NULL, 'http://www.dgist.ac.kr', 'dgist.ac.kr', NULL, 5);
INSERT INTO public.universities VALUES (102, '대구공업대학교', '대구광역시 달서구 송현로 205 (본동, 대구공업대학)', NULL, 'http://www.ttc.ac.kr', 'ttc.ac.kr', NULL, 5);
INSERT INTO public.universities VALUES (103, '대구과학대학교', '대구광역시 북구 영송로 47 (태전동, 대구과학대학)', NULL, 'http://www.tsu.ac.kr', 'tsu.ac.kr', NULL, 5);
INSERT INTO public.universities VALUES (104, '대구교육대학교', '대구광역시 남구 중앙대로 219 (대명동, 대구교육대학교)', NULL, 'http://www.dnue.ac.kr', 'dnue.ac.kr', NULL, 5);
INSERT INTO public.universities VALUES (105, '대구대학교', '경상북도 경산시 진량읍 대구대로 201 (내리리, 대구대학교경산캠퍼스)', NULL, 'http://www.daegu.ac.kr', 'daegu.ac.kr', NULL, 14);
INSERT INTO public.universities VALUES (106, '대구보건대학교', '대구광역시 북구 영송로 15 (태전동, 대구보건대학)', NULL, 'http://www.dhc.ac.kr', 'dhc.ac.kr', NULL, 5);
INSERT INTO public.universities VALUES (107, '대구사이버대학교', '경상북도 경산시 진량읍 대구대로 201 (내리리, 대구대학교경산캠퍼스)', NULL, 'http://www.dcu.ac.kr', 'dcu.ac.kr', NULL, 14);
INSERT INTO public.universities VALUES (108, '대구예술대학교', '경상북도 칠곡군 가산면 다부거문1길 202 (다부리, 대구예술대학교)', NULL, 'http://www.dgau.ac.kr', 'dgau.ac.kr', NULL, 14);
INSERT INTO public.universities VALUES (109, '대구한의대학교', '경상북도 경산시 한의대로 1 (유곡동, 대구한의대학교)', NULL, 'http://www.dhu.ac.kr', 'dhu.ac.kr', NULL, 14);
INSERT INTO public.universities VALUES (110, '대덕대학교', '대전광역시 유성구 가정북로 68 (장동, 대덕대학교)', NULL, 'https://www.ddu.ac.kr', 'ddu.ac.kr', NULL, 4);
INSERT INTO public.universities VALUES (111, '대동대학교', '부산광역시 금정구 동부곡로27번길 88 (부곡동, 대동대학교)', NULL, 'http://www.daedong.ac.kr', 'daedong.ac.kr', NULL, 2);
INSERT INTO public.universities VALUES (112, '대림대학교', '경기도 안양시 동안구 임곡로 29 (비산동, 대림대학교)', NULL, 'http://www.daelim.ac.kr', 'daelim.ac.kr', NULL, 8);
INSERT INTO public.universities VALUES (113, '대신대학교', '경상북도 경산시 경청로222길 33 (백천동, 대신대학교)', NULL, 'http://www.daeshin.ac.kr', 'daeshin.ac.kr', NULL, 14);
INSERT INTO public.universities VALUES (114, '대원대학교', '충청북도 제천시 대학로 316 (신월동, 대원대학)', NULL, 'http://www.daewon.ac.kr', 'daewon.ac.kr', NULL, 10);
INSERT INTO public.universities VALUES (116, '대전과학기술대학교', '대전광역시 서구 혜천로 100 (복수동, 대전과학기술대학교)', NULL, 'http://www.dst.ac.kr', 'dst.ac.kr', NULL, 4);
INSERT INTO public.universities VALUES (117, '대전대학교', '대전광역시 동구 대학로 62 (용운동, 대전대학교)', NULL, 'http://www.dju.ac.kr', 'dju.ac.kr', NULL, 4);
INSERT INTO public.universities VALUES (118, '대전보건대학교', '대전광역시 동구 충정로 21 (가양동, 대전보건대학)', NULL, 'http://www.hit.ac.kr', 'hit.ac.kr', NULL, 4);
INSERT INTO public.universities VALUES (119, '대전신학대학교', '대전광역시 대덕구 한남로 41 (오정동, 대전신학대학교)', NULL, 'http://www.daejeon.ac.kr', 'daejeon.ac.kr', NULL, 4);
INSERT INTO public.universities VALUES (120, '대진대학교', '경기도 포천시 호국로 1007 (선단동, 대진대학교)', NULL, 'http://www.daejin.ac.kr', 'daejin.ac.kr', NULL, 8);
INSERT INTO public.universities VALUES (121, '덕성여자대학교', '서울특별시 도봉구 삼양로144길 33 (쌍문동, 덕성여자대학교)', NULL, 'http://www.duksung.ac.kr', 'duksung.ac.kr', NULL, 1);
INSERT INTO public.universities VALUES (122, '동강대학교', '광주광역시 북구 동문대로 50 (풍향동, 동강대학교)', NULL, 'http://www.dkc.ac.kr', 'dkc.ac.kr', NULL, 7);
INSERT INTO public.universities VALUES (123, '동국대학교', '서울특별시 중구 필동로1길 30 (장충동2가, 동국대학교)', NULL, 'http://www.dongguk.edu', 'dongguk.edu', NULL, 1);
INSERT INTO public.universities VALUES (82, '국제사이버대학교', '경기도 수원시 팔달구 경수대로 490 (인계동)', NULL, 'http://www.gjcu.ac.kr', 'gcu.ac', NULL, 8);
INSERT INTO public.universities VALUES (125, '동남보건대학교', '경기도 수원시 장안구 천천로74번길 50 (정자동, 동남보건대학)', NULL, 'http://www.dongnam.ac.kr', 'dongnam.ac.kr', NULL, 8);
INSERT INTO public.universities VALUES (126, '동덕여자대학교', '서울특별시 성북구 화랑로13길 60 (하월곡동, 동덕여자대학교)', NULL, 'http://www.dongduk.ac.kr', 'dongduk.ac.kr', NULL, 1);
INSERT INTO public.universities VALUES (127, '동명대학교', '부산광역시 남구 신선로 428 (용당동, 동명대학교)', NULL, 'http://www.tu.ac.kr', 'tu.ac.kr', NULL, 2);
INSERT INTO public.universities VALUES (128, '동서대학교', '부산 사상구 주례로 47 동서대학교', NULL, 'https://www.dongseo.ac.kr', 'dongseo.ac.kr', NULL, 2);
INSERT INTO public.universities VALUES (129, '동서울대학교', '경기도 성남시 수정구 복정로 76 (복정동, 동서울대학)', NULL, 'http://www.du.ac.kr', 'du.ac.kr', NULL, 8);
INSERT INTO public.universities VALUES (131, '동아대학교', '부산광역시 사하구 낙동대로550번길 37 (하단동, 동아대학교)', NULL, 'http://www.donga.ac.kr', 'donga.ac.kr', NULL, 2);
INSERT INTO public.universities VALUES (132, '동아방송예술대학교', '경기도 안성시 삼죽면 동아예대길 47 (진촌리, 동아방송예술대학교)', NULL, 'http://www.dima.ac.kr', 'dima.ac.kr', NULL, 8);
INSERT INTO public.universities VALUES (133, '동아보건대학교', '전라남도 영암군 학산면 영산로 76-57 (독천리, 동아보건대학교)', NULL, 'http://www.duh.ac.kr', 'duh.ac.kr', NULL, 13);
INSERT INTO public.universities VALUES (134, '동양대학교', '경상북도 영주시 풍기읍 동양대로 145 (산법리, 동양대학교)', NULL, 'http://www.dyu.ac.kr', 'dyu.ac.kr', NULL, 14);
INSERT INTO public.universities VALUES (135, '동양미래대학교', '서울특별시 구로구 경인로 445 (고척동, 동양미래대학교)', NULL, 'http://www.dongyang.ac.kr/', 'dongyang.ac.kr', NULL, 1);
INSERT INTO public.universities VALUES (136, '동원과학기술대학교', '경상남도 양산시 명곡로 321 (명곡동, 동원과학기술대학교)', NULL, 'http://www.dist.ac.kr', 'dist.ac.kr', NULL, 15);
INSERT INTO public.universities VALUES (137, '동원대학교', '경기도 광주시 곤지암읍 경충대로 26 (신촌리, 동원대학)', NULL, 'http://www.tw.ac.kr', 'tw.ac.kr', NULL, 8);
INSERT INTO public.universities VALUES (138, '동의과학대학교', '부산광역시 부산진구 양지로 54 (양정동, 동의과학대학)', NULL, 'http://www.dit.ac.kr', 'dit.ac.kr', NULL, 2);
INSERT INTO public.universities VALUES (139, '동의대학교', '부산광역시 부산진구 엄광로 176 (가야동, 동의대학교)', NULL, 'http://www.deu.ac.kr', 'deu.ac.kr', NULL, 2);
INSERT INTO public.universities VALUES (141, '디지털서울문화예술대학교', '서울특별시 서대문구 통일로37길 60 (홍제동, 디지털서울문화예술대학교)', NULL, 'http://www.scau.ac.kr', 'scau.ac.kr', NULL, 1);
INSERT INTO public.universities VALUES (142, '루터대학교', '경기 용인시 기흥구 금화로82번길 20', NULL, 'http://www.ltu.ac.kr', 'ltu.ac.kr', NULL, 8);
INSERT INTO public.universities VALUES (143, '마산대학교', '경상남도 창원시 마산회원구 내서읍 함마대로 2640 (용담리, 마산대학)', NULL, 'http://www.masan.ac.kr', 'masan.ac.kr', NULL, 15);
INSERT INTO public.universities VALUES (144, '명지대학교 자연캠퍼스', '경기도 용인시 처인구 명지로 116 (남동, 명지대학교용인캠퍼스)', NULL, 'https://www.mju.ac.kr/', 'mju.ac.kr', NULL, 8);
INSERT INTO public.universities VALUES (145, '명지전문대학', '서울특별시 서대문구 가좌로 134 (홍은동, 명지전문대학)', NULL, 'http://www.mjc.ac.kr', 'mjc.ac.kr', NULL, 1);
INSERT INTO public.universities VALUES (146, '목원대학교', '대전광역시 서구 도안북로 88 (도안동, 목원대학교)', NULL, 'http://www.mokwon.ac.kr', 'mokwon.ac.kr', NULL, 4);
INSERT INTO public.universities VALUES (147, '목포가톨릭대학교', '전라남도 목포시 영산로 697 (석현동, 목포가톨릭대학교)', NULL, 'http://www.mcu.ac.kr', 'mcu.ac.kr', NULL, 13);
INSERT INTO public.universities VALUES (148, '목포과학대학교', '전라남도 목포시 영산로 413-1 (상동, 목포과학대학)', NULL, 'http://www.msu.ac.kr', 'msu.ac.kr', NULL, 13);
INSERT INTO public.universities VALUES (149, '문경대학교', '경상북도 문경시 호계면 대학길 161 (별암리, 문경대학)', NULL, 'http://www.mkc.ac.kr', 'mkc.ac.kr', NULL, 14);
INSERT INTO public.universities VALUES (150, '배재대학교', '대전광역시 서구 배재로 155-40 (도마동, 배재대학교)', NULL, 'http://www.pcu.ac.kr', 'pcu.ac.kr', NULL, 4);
INSERT INTO public.universities VALUES (151, '배화여자대학교', '서울특별시 종로구 필운대로1길 34 (필운동, 배화여자대학교,배화여자중,고등학교)', NULL, 'http://www.baewha.ac.kr', 'baewha.ac.kr', NULL, 1);
INSERT INTO public.universities VALUES (152, '백석대학교', '충청남도 천안시 동남구 백석대학로 1 (안서동, 백석대학교,백석문화대학교)', NULL, 'https://www.bu.ac.kr', 'bu.ac.kr', NULL, 11);
INSERT INTO public.universities VALUES (153, '백석문화대학교', '충청남도 천안시 동남구 백석대학로 1-2', NULL, 'http://www.bscu.ac.kr', 'bscu.ac.kr', NULL, 11);
INSERT INTO public.universities VALUES (154, '백석예술대학교', '서울특별시 서초구 방배로9길 23 (방배동, 백석예술대학교)', NULL, 'http://www.bau.ac.kr', 'bau.ac.kr', NULL, 1);
INSERT INTO public.universities VALUES (155, '백제예술대학교', '전라북도 완주군 봉동읍 백제대학로 171 (제내리, 백제예술대학교)', NULL, 'http://www.paekche.ac.kr', 'paekche.ac.kr', NULL, 12);
INSERT INTO public.universities VALUES (156, '부산가톨릭대학교', '부산광역시 금정구 오륜대로 57 (부곡동, 부산가톨릭대학교)', NULL, 'http://www.cup.ac.kr', 'cup.ac.kr', NULL, 2);
INSERT INTO public.universities VALUES (157, '부산경상대학교', '부산광역시 연제구 고분로 170 (연산동, 부산경상대학)', NULL, 'http://www.bsks.ac.kr', 'bsks.ac.kr', NULL, 2);
INSERT INTO public.universities VALUES (159, '부산교육대학교', '부산광역시 연제구 교대로 24 (거제동, 부산교육대학교)', NULL, 'http://www.bnue.ac.kr', 'bnue.ac.kr', NULL, 2);
INSERT INTO public.universities VALUES (160, '부산대학교', '부산광역시 금정구 부산대학로63번길 2 (장전동, 부산대학교)', NULL, 'http://www.pusan.ac.kr', 'pusan.ac.kr', NULL, 2);
INSERT INTO public.universities VALUES (161, '부산디지털대학교', '부산광역시 사상구 주례로 57 (주례동, 부산디지털대학교)', NULL, 'http://www.bdu.ac.kr', 'bdu.ac.kr', NULL, 2);
INSERT INTO public.universities VALUES (162, '부산보건대학교', '부산광역시 사하구 사리로55번길 16 (괴정동, 동주대학)', NULL, 'http://www.bhu.ac.kr', 'bhu.ac.kr', NULL, 2);
INSERT INTO public.universities VALUES (163, '부산여자대학교', '부산광역시 부산진구 진남로 506 (양정동, 부산여자대학)', NULL, 'http://www.bwc.ac.kr', 'bwc.ac.kr', NULL, 2);
INSERT INTO public.universities VALUES (164, '부산예술대학교', '부산광역시 남구 못골번영로71번길 74 (대연동, 부산예술대학)', NULL, 'http://www.busanarts.ac.kr', 'busanarts.ac.kr', NULL, 2);
INSERT INTO public.universities VALUES (165, '부산외국어대학교', '부산광역시 금정구 금샘로485번길 65 (남산동, 부산외국어대학교)', NULL, 'http://www.bufs.ac.kr', 'bufs.ac.kr', NULL, 2);
INSERT INTO public.universities VALUES (166, '부산장신대학교', '경상남도 김해시 김해대로 1894-68 (구산동)', NULL, 'http://www.bpu.ac.kr', 'bpu.ac.kr', NULL, 15);
INSERT INTO public.universities VALUES (167, '부천대학교', '경기도 부천시 원미구 신흥로56번길 25 (심곡동, 부천대학)', NULL, 'http://www.bc.ac.kr', 'bc.ac.kr', NULL, 8);
INSERT INTO public.universities VALUES (168, '사이버한국외국어대학교', '서울특별시 동대문구 이문로 107 (이문동, 한국외국어대학교)', NULL, 'http://www.cufs.ac.kr', 'cufs.ac.kr', NULL, 1);
INSERT INTO public.universities VALUES (170, '삼육대학교', '서울특별시 노원구 화랑로 815 (공릉동, 삼육대학교)', NULL, 'http://www.syu.ac.kr', 'syu.ac.kr', NULL, 1);
INSERT INTO public.universities VALUES (171, '삼육보건대학교', '서울특별시 동대문구 망우로 82 (휘경동)', NULL, 'http://www.shu.ac.kr', 'shu.ac.kr', NULL, 1);
INSERT INTO public.universities VALUES (174, '서강대학교', '서울특별시 마포구 백범로 35 (신수동, 서강대학교)', NULL, 'http://www.sogang.ac.kr', 'sogang.ac.kr', NULL, 1);
INSERT INTO public.universities VALUES (175, '서경대학교', '서울특별시 성북구 서경로 124 (정릉동, 서경대학)', NULL, 'http://www.skuniv.ac.kr', 'skuniv.ac.kr', NULL, 1);
INSERT INTO public.universities VALUES (130, '동신대학교', '전라남도 나주시 동신대길 67 (대호동, 동신대학교중앙도서관동)', NULL, 'http://www.dsu.ac.kr', 'dsu.kr', NULL, 13);
INSERT INTO public.universities VALUES (172, '상명대학교', '서울특별시 종로구 홍지문2길 20 (홍지동, 상명대학교)', NULL, 'http://www.smu.ac.kr', 'sangmyung.kr', NULL, 1);
INSERT INTO public.universities VALUES (177, '서영대학교', '광주광역시 북구 서강로 1 (운암동, 서영대학교)', NULL, 'http://www.seoyeong.ac.kr', 'seoyeong.ac.kr', NULL, 7);
INSERT INTO public.universities VALUES (178, '서울과학기술대학교', '서울특별시 노원구 공릉로 232 (공릉동, 서울과학기술대학교)', NULL, 'http://www.seoultech.ac.kr', 'seoultech.ac.kr', NULL, 1);
INSERT INTO public.universities VALUES (179, '서울교육대학교', '서울특별시 서초구 서초중앙로 96 (서초동, 서울교육대학교,서울교대초등학교)', NULL, 'http://www.snue.ac.kr', 'snue.ac.kr', NULL, 1);
INSERT INTO public.universities VALUES (182, '서울디지털대학교', '서울특별시 강서구 공항대로 424 (화곡동, 서울디지털대학교)', NULL, 'http://www.sdu.ac.kr', 'sdu.ac.kr', NULL, 1);
INSERT INTO public.universities VALUES (183, '서울사이버대학교', '서울특별시 강북구 솔매로49길 60 (미아동, 서울사이버대학교)', NULL, 'http://www.iscu.ac.kr', 'iscu.ac.kr', NULL, 1);
INSERT INTO public.universities VALUES (185, '서울신학대학교', '경기도 부천시 소사구 호현로489번길 52 (소사본동, 서울신학대학교)', NULL, 'http://www.stu.ac.kr', 'stu.ac.kr', NULL, 8);
INSERT INTO public.universities VALUES (186, '서울여자간호대학교', '서울특별시 서대문구 간호대로 38 (홍제동, 서울여자간호대학)', NULL, 'http://www.snjc.ac.kr', 'snjc.ac.kr', NULL, 1);
INSERT INTO public.universities VALUES (187, '서울여자대학교', '서울특별시 노원구 화랑로 621 (공릉동, 서울여자대학교)', NULL, 'http://www.swu.ac.kr', 'swu.ac.kr', NULL, 1);
INSERT INTO public.universities VALUES (188, '서울예술대학교', '경기도 안산시 단원구 예술대학로 171 (고잔동, 서울예술대학)', NULL, 'http://www.seoularts.ac.kr', 'seoularts.ac.kr', NULL, 8);
INSERT INTO public.universities VALUES (189, '서울장신대학교', '경기도 광주시 경안로 145 (경안동, 서울장신대학교)', NULL, 'http://www.sjs.ac.kr', 'sjs.ac.kr', NULL, 8);
INSERT INTO public.universities VALUES (190, '서울한영대학교', '서울특별시 구로구 경인로 290-42 (개봉동, 서울한영대학교)', NULL, 'http://www.shyu.ac.kr', 'shyu.ac.kr', NULL, 1);
INSERT INTO public.universities VALUES (191, '서원대학교', '충청북도 청주시 서원구 무심서로 377-3 (모충동, 서원대학교)', NULL, 'http://www.seowon.ac.kr', 'seowon.ac.kr', NULL, 10);
INSERT INTO public.universities VALUES (192, '서일대학교', '서울특별시 중랑구 용마산로90길 28 (면목동, 서일대학)', NULL, 'http://www.seoil.ac.kr', 'seoil.ac.kr', NULL, 1);
INSERT INTO public.universities VALUES (193, '서정대학교', '경기도 양주시 은현면 서정로 27 (용암리, 서정대학)', NULL, 'http://www.seojeong.ac.kr', 'seojeong.ac.kr', NULL, 8);
INSERT INTO public.universities VALUES (194, '선린대학교', '경상북도 포항시 북구 흥해읍 초곡길36번길 30 (초곡리, 선린대학교)', NULL, 'https://www.sunlin.ac.kr', 'sunlin.ac.kr', NULL, 14);
INSERT INTO public.universities VALUES (195, '선문대학교', '충청남도 아산시 탕정면 선문로221번길 70 (갈산리, 선문대학교)', NULL, 'http://www.sunmoon.ac.kr', 'sunmoon.ac.kr', NULL, 11);
INSERT INTO public.universities VALUES (196, '성결대학교', '경기도 안양시 만안구 성결대학로 53 (안양동, 성결대학교)', NULL, 'http://www.sungkyul.ac.kr', 'sungkyul.ac.kr', NULL, 8);
INSERT INTO public.universities VALUES (197, '성공회대학교', '서울특별시 구로구 연동로 320 (항동, 성공회대학교)', NULL, 'http://www.skhu.ac.kr', 'skhu.ac.kr', NULL, 1);
INSERT INTO public.universities VALUES (198, '성균관대학교', '서울특별시 종로구 성균관로 25-2 (명륜3가, 성균관대학교)', NULL, 'http://www.skku.edu', 'skku.edu', NULL, 1);
INSERT INTO public.universities VALUES (199, '성신여자대학교', '서울특별시 성북구 보문로34다길 2 (돈암동, 성신여자대학교)', NULL, 'http://www.sungshin.ac.kr', 'sungshin.ac.kr', NULL, 1);
INSERT INTO public.universities VALUES (200, '성운대학교', '경상북도 영천시 신녕면 대학길 105 (화남리, 성운대학교)', NULL, 'http://www.sw.ac.kr', 'sw.ac.kr', NULL, 14);
INSERT INTO public.universities VALUES (202, '세계사이버대학', '경기도 광주시 오포읍 태재로 90 (신현리)', NULL, 'http://www.world.ac.kr', 'world.ac.kr', NULL, 8);
INSERT INTO public.universities VALUES (203, '세명대학교', '충청북도 제천시 세명로 65 (신월동, 세명대학교)', NULL, 'http://www.semyung.ac.kr', 'semyung.ac.kr', NULL, 10);
INSERT INTO public.universities VALUES (204, '세종대학교', '서울특별시 광진구 능동로 209 (군자동, 세종대학교)', NULL, 'http://www.sejong.ac.kr', 'sejong.ac.kr', NULL, 1);
INSERT INTO public.universities VALUES (206, '세한대학교', '전라남도 영암군 삼호읍 녹색로 1113 (산호리, 세한대학교)', NULL, 'http://www.sehan.ac.kr', 'sehan.ac.kr', NULL, 13);
INSERT INTO public.universities VALUES (208, '송원대학교', '광주광역시 남구 송암로 73 (송하동, 송원대학)', NULL, 'http://www.songwon.ac.kr', 'songwon.ac.kr', NULL, 7);
INSERT INTO public.universities VALUES (210, '수성대학교', '대구광역시 수성구 달구벌대로528길 15 (만촌동, 수성대학교)', NULL, 'http://WWW.SC.AC.KR', 'sc.ac.kr', NULL, 5);
INSERT INTO public.universities VALUES (211, '수원가톨릭대학교', '경기도 화성시 봉담읍 왕림1길 67 (왕림리, 수원가톨릭대학교)', NULL, 'http://www.suwoncatholic.ac.kr', 'suwoncatholic.ac.kr', NULL, 8);
INSERT INTO public.universities VALUES (212, '수원과학대학교', '경기도 화성시 정남면 세자로 288 (보통리, 수원과학대학)', NULL, 'http://www.ssc.ac.kr', 'ssc.ac.kr', NULL, 8);
INSERT INTO public.universities VALUES (214, '수원여자대학교', '경기도 수원시 권선구 온정로 72 (오목천동, 수원여자대학)', NULL, 'https://www.swwu.ac.kr/swwu.do', 'swwu.ac.kr', NULL, 8);
INSERT INTO public.universities VALUES (215, '숙명여자대학교', '서울특별시 용산구 청파로47길 100 (청파동2가, 숙명여자대학교)', NULL, 'http://www.sookmyung.ac.kr', 'sookmyung.ac.kr', NULL, 1);
INSERT INTO public.universities VALUES (216, '순복음총회신학교', '충청북도 제천시 덕산면 도전로 320 (도전리)', NULL, 'http://www.kcc.ac.kr', 'kcc.ac.kr', NULL, 10);
INSERT INTO public.universities VALUES (217, '순천제일대학교', '전라남도 순천시 제일대학길 17 (덕월동, 순천제일대학)', NULL, 'http://www.suncheon.ac.kr', 'suncheon.ac.kr', NULL, 13);
INSERT INTO public.universities VALUES (218, '순천향대학교', '충청남도 아산시 신창면 순천향로 22 (읍내리, 순천향대학교)', NULL, 'http://www.sch.ac.kr', 'sch.ac.kr', NULL, 11);
INSERT INTO public.universities VALUES (220, '숭실사이버대학교', '서울특별시 종로구 삼일대로30길 23 (익선동, BIZWELL종로오피스텔)', NULL, 'http://www.kcu.ac', 'kcu.ac', NULL, 1);
INSERT INTO public.universities VALUES (221, '숭의여자대학교', '서울특별시 중구 소파로2길 10 (예장동, 숭의여자대학)', NULL, 'http://www.sewc.ac.kr', 'sewc.ac.kr', NULL, 1);
INSERT INTO public.universities VALUES (222, '신경주대학교', '경상북도 경주시 태종로 188 (효현동, 경주대학교)', NULL, 'http://www.gu.ac.kr', 'gu.ac.kr', NULL, 14);
INSERT INTO public.universities VALUES (223, '신구대학교', '경기도 성남시 중원구 광명로 377 (금광동, 신구대학)', NULL, 'http://www.shingu.ac.kr', 'shingu.ac.kr', NULL, 8);
INSERT INTO public.universities VALUES (224, '신라대학교', '부산광역시 사상구 백양대로700번길 140 (괘법동, 신라대학교)', NULL, 'http://www.silla.ac.kr', 'silla.ac.kr', NULL, 2);
INSERT INTO public.universities VALUES (225, '신성대학교', '충청남도 당진시 정미면 대학로 1 (덕마리, 신성대학교)', NULL, 'http://www.shinsung.ac.kr', 'shinsung.ac.kr', NULL, 11);
INSERT INTO public.universities VALUES (226, '신안산대학교', '경기도 안산시 단원구 신안산대학로 135 (초지동, 안산공과대학)', NULL, 'http://www.sau.ac.kr', 'sau.ac.kr', NULL, 8);
INSERT INTO public.universities VALUES (227, '신한대학교', '경기도 동두천시 벌마들로40번길 30 (상패동, 신한대학교)', NULL, 'http://www.shinhan.ac.kr', 'shinhan.ac.kr', NULL, 8);
INSERT INTO public.universities VALUES (228, '아신대학교', '경기도 양평군 옥천면 경강로 1276 (아신리, 아신대학교)', NULL, 'http://www.acts.ac.kr', 'acts.ac.kr', NULL, 8);
INSERT INTO public.universities VALUES (181, '서울대학교', '서울특별시 관악구 관악로 1 (신림동, 서울대학교)', NULL, 'http://www.snu.ac.kr', 'snu.ac.kr', 'https://uniwiki-bucket.s3.ap-northeast-2.amazonaws.com/uni-logo/%EC%84%9C%EC%9A%B8%EB%8C%80%ED%95%99%EA%B5%90.png', 1);
INSERT INTO public.universities VALUES (184, '서울시립대학교', '서울특별시 동대문구 서울시립대로 163 (전농동, 서울시립대학교)', NULL, 'http://www.uos.ac.kr', 'uos.ac.kr', 'https://uniwiki-bucket.s3.ap-northeast-2.amazonaws.com/uni-logo/%EC%84%9C%EC%9A%B8%EC%8B%9C%EB%A6%BD%EB%8C%80%ED%95%99%EA%B5%90.png', 1);
INSERT INTO public.universities VALUES (229, '아주대학교', '경기도 수원시 영통구 월드컵로 206 (원천동, 아주대학교)', NULL, 'http://www.ajou.ac.kr', 'ajou.ac.kr', NULL, 8);
INSERT INTO public.universities VALUES (230, '아주자동차대학교', '충남 보령시 주포면 대학길 106 (아주자동차대학교)', NULL, 'https://www.motor.ac.kr', 'motor.ac.kr', NULL, 11);
INSERT INTO public.universities VALUES (231, '안동과학대학교', '경상북도 안동시 서후면 서선길 189 (교리, 안동과학대학교)', NULL, 'http://www.asc.ac.kr', 'asc.ac.kr', NULL, 14);
INSERT INTO public.universities VALUES (232, '안산대학교', '경기도 안산시 상록구 안산대학로 155 (일동, 안산대학교)', NULL, 'http://www.ansan.ac.kr', 'ansan.ac.kr', NULL, 8);
INSERT INTO public.universities VALUES (234, '여주대학교', '경기도 여주시 세종로 338 (교동, 여주대학)', NULL, 'http://www.yit.ac.kr', 'yit.ac.kr', NULL, 8);
INSERT INTO public.universities VALUES (235, '연성대학교', '경기도 안양시 만안구 양화로37번길 34 (안양동, 연성대학교)', NULL, 'http://www.yeonsung.ac.kr', 'yeonsung.ac.kr', NULL, 8);
INSERT INTO public.universities VALUES (238, '연암공과대학교', '경상남도 진주시 진주대로629번길 35 (가좌동, 연암공과대학교)', NULL, 'http://www.yc.ac.kr', 'yc.ac.kr', NULL, 15);
INSERT INTO public.universities VALUES (239, '연암대학교', '충청남도 천안시 서북구 성환읍 연암로 313 (수향리, 천안연암대학)', NULL, 'http://www.yonam.ac.kr', 'yonam.ac.kr', NULL, 11);
INSERT INTO public.universities VALUES (240, '영남대학교', '경상북도 경산시 대학로 280 (대동, 영남대학교)', NULL, 'http://www.yu.ac.kr', 'yu.ac.kr', NULL, 14);
INSERT INTO public.universities VALUES (241, '영남사이버대학교', '경상북도 경산시 남천면 남천로 780-9 (협석리, 영남외국어대학)', NULL, 'http://www.yncu.ac.kr', 'yncu.ac.kr', NULL, 14);
INSERT INTO public.universities VALUES (242, '영남신학대학교', '경상북도 경산시 진량읍 봉회1길 26 (봉회리, 영남신학대학교)', NULL, 'http://www.ytus.ac.kr', 'ytus.ac.kr', NULL, 14);
INSERT INTO public.universities VALUES (243, '영남외국어대학', '경상북도 경산시 남천면 남천로 780-9 (협석리, 영남외국어대학)', NULL, 'http://www.yflc.ac.kr', 'yflc.ac.kr', NULL, 14);
INSERT INTO public.universities VALUES (244, '영남이공대학교', '대구광역시 남구 현충로 170 (대명동, 영남이공대학)', NULL, 'http://www.ync.ac.kr', 'ync.ac.kr', NULL, 5);
INSERT INTO public.universities VALUES (245, '영산대학교', '경상남도 양산시 주남로 288 (주남동, 영산대학교양산캠퍼스)', NULL, 'http://www.ysu.ac.kr', 'ysu.ac.kr', NULL, 15);
INSERT INTO public.universities VALUES (246, '영산선학대학교', '전라남도 영광군 백수읍 성지로 1357 (길용리)', NULL, 'http://www.youngsan.ac.kr', 'youngsan.ac.kr', NULL, 13);
INSERT INTO public.universities VALUES (247, '영진사이버대학교', '대구광역시 북구 복현로 35 (복현동, 영진전문대학)', NULL, 'http://www.ycc.ac.kr', 'ycc.ac.kr', NULL, 5);
INSERT INTO public.universities VALUES (248, '영진전문대학교', '대구광역시 북구 복현로 35 (복현동, 영진전문대학)', NULL, 'http://www.yju.ac.kr', 'yju.ac.kr', NULL, 5);
INSERT INTO public.universities VALUES (249, '예수대학교', '전라북도 전주시 완산구 서원로 383 (중화산동1가, 예수대학교)', NULL, 'http://www.jesus.ac.kr', 'jesus.ac.kr', NULL, 12);
INSERT INTO public.universities VALUES (250, '예원예술대학교', '전라북도 임실군 신평면 창인로 117 (창인리, 예원예술학교)', NULL, 'http://www.yewon.ac.kr', 'yewon.ac.kr', NULL, 12);
INSERT INTO public.universities VALUES (251, '오산대학교', '경기도 오산시 청학로 45 (청학동, 오산대학)', NULL, 'http://www.osan.ac.kr', 'osan.ac.kr', NULL, 8);
INSERT INTO public.universities VALUES (252, '용인대학교', '경기도 용인시 처인구 용인대학로 134 (삼가동, 용인대학교)', NULL, 'http://www.yongin.ac.kr', 'yongin.ac.kr', NULL, 8);
INSERT INTO public.universities VALUES (253, '용인예술과학대학교', '경기도 용인시 처인구 동부로 61 (마평동, 용인예술과학대학교)', NULL, 'https://www.ysc.ac.kr', 'ysc.ac.kr', NULL, 8);
INSERT INTO public.universities VALUES (254, '우석대학교', '전북 완주군 삼례읍 삼례로 443', NULL, 'http://www.woosuk.ac.kr', 'woosuk.ac.kr', NULL, 12);
INSERT INTO public.universities VALUES (255, '우송대학교', '대전광역시 동구 동대전로 171 (자양동, 우송정보대학,우송대서캠퍼스)', NULL, 'http://www.wsu.ac.kr', 'wsu.ac.kr', NULL, 4);
INSERT INTO public.universities VALUES (256, '우송정보대학', '대전광역시 동구 백룡로 59 우송정보대학', NULL, 'http://www.wsi.ac.kr', 'wsi.ac.kr', NULL, 4);
INSERT INTO public.universities VALUES (257, '울산과학기술원', '울산광역시 울주군 언양읍 유니스트길 50 (반연리, 울산과학기술대학교)', NULL, 'http://www.unist.ac.kr', 'unist.ac.kr', NULL, 6);
INSERT INTO public.universities VALUES (258, '울산과학대학교', '울산광역시 동구 봉수로 101 (화정동, 울산과학대학동부캠퍼스)', NULL, 'http://www.uc.ac.kr', 'uc.ac.kr', NULL, 6);
INSERT INTO public.universities VALUES (259, '울산대학교', '울산광역시 남구 대학로 93 (무거동, 울산대학교)', NULL, 'http://www.ulsan.ac.kr', 'ulsan.ac.kr', NULL, 6);
INSERT INTO public.universities VALUES (260, '웅지세무대학교', '경기도 파주시 탄현면 웅지로144번길 73 (금승리, 웅지세무대학)', NULL, 'http://www.wat.ac.kr', 'wat.ac.kr', NULL, 8);
INSERT INTO public.universities VALUES (261, '원광대학교', '전라북도 익산시 익산대로 460 (신동, 원광대학교)', NULL, 'http://www.wonkwang.ac.kr', 'wonkwang.ac.kr', NULL, 12);
INSERT INTO public.universities VALUES (262, '원광디지털대학교', '전라북도 익산시 익산대로 460 (신동, 원광디지털대학교)', NULL, 'http://www.wdu.ac.kr', 'wdu.ac.kr', NULL, 12);
INSERT INTO public.universities VALUES (263, '원광보건대학교', '전라북도 익산시 익산대로 514 (신용동, 원광보건대학)', NULL, 'http://www.wu.ac.kr', 'wu.ac.kr', NULL, 12);
INSERT INTO public.universities VALUES (264, '위덕대학교', '경상북도 경주시 강동면 동해대로 261 (유금리, 위덕대학교)', NULL, 'http://www.uu.ac.kr', 'uu.ac.kr', NULL, 14);
INSERT INTO public.universities VALUES (265, '유원대학교', '충청북도 영동군 영동읍 대학로 310 (설계리, U1대학교)', NULL, 'http://www.u1.ac.kr', 'u1.ac.kr', NULL, 10);
INSERT INTO public.universities VALUES (266, '유한대학교', '경기도 부천시 소사구 경인로 590 (괴안동, 유한대학)', NULL, 'http://www.yuhan.ac.kr', 'yuhan.ac.kr', NULL, 8);
INSERT INTO public.universities VALUES (267, '을지대학교', '대전광역시 중구 계룡로771번길 77 (목동, 을지대학교대전캠퍼스)', NULL, 'http://www.eulji.ac.kr', 'eulji.ac.kr', NULL, 4);
INSERT INTO public.universities VALUES (269, '인덕대학교', '서울특별시 노원구 초안산로 12 (월계동, 인덕대학)', NULL, 'http://www.induk.ac.kr', 'induk.ac.kr', NULL, 1);
INSERT INTO public.universities VALUES (270, '인제대학교', '경상남도 김해시 인제로 197 (어방동, 인제대학교)', NULL, 'http://www.inje.ac.kr', 'inje.ac.kr', NULL, 15);
INSERT INTO public.universities VALUES (271, '인천가톨릭대학교', '인천광역시 강화군 양도면 고려왕릉로 53-1 (도장리)', NULL, 'http://www.iccu.ac.kr', 'iccu.ac.kr', NULL, 3);
INSERT INTO public.universities VALUES (272, '인천대학교', '인천광역시 연수구 아카데미로 119 (송도동, 인천대학교)', NULL, 'http://www.inu.ac.kr', 'inu.ac.kr', NULL, 3);
INSERT INTO public.universities VALUES (273, '인하공업전문대학', '인천광역시 미추홀구 인하로 100 (용현동, 인하대,인하공전,정석항공고)', NULL, 'http://www.inhatc.ac.kr', 'inhatc.ac.kr', NULL, 3);
INSERT INTO public.universities VALUES (275, '장로회신학대학교', '서울특별시 광진구 광장로5길 25-1 (광장동, 장로회신학대학교)', NULL, 'http://www.puts.ac.kr', 'puts.ac.kr', NULL, 1);
INSERT INTO public.universities VALUES (276, '장안대학교', '경기도 화성시 봉담읍 삼천병마로 1182 (상리, 장안대학)', NULL, 'http://www.jangan.ac.kr', 'jangan.ac.kr', NULL, 8);
INSERT INTO public.universities VALUES (277, '재능대학교', '인천광역시 동구 재능로 178 (송림동, 재능대학)', NULL, 'http://www.jeiu.ac.kr', 'jeiu.ac.kr', NULL, 3);
INSERT INTO public.universities VALUES (268, '이화여자대학교', '서울 서대문구 이화여대길 52', NULL, 'http://www.ewha.ac.kr', 'ewhain.net', NULL, 1);
INSERT INTO public.universities VALUES (274, '인하대학교', '인천광역시 미추홀구 인하로 100 (용현동, 인하대학교)', NULL, 'http://www.inha.ac.kr', 'inha.edu', 'https://uniwiki-bucket.s3.ap-northeast-2.amazonaws.com/uni-logo/%EC%9D%B8%ED%95%98%EB%8C%80%ED%95%99%EA%B5%90.png', 3);
INSERT INTO public.universities VALUES (233, '안양대학교', '경기도 안양시 만안구 삼덕로37번길 22 (안양동, 안양대학교)', NULL, 'http://www.anyang.ac.kr/main.do', 'ayum.anyang.ac.kr', NULL, 8);
INSERT INTO public.universities VALUES (278, '전남과학대학교', '전라남도 곡성군 옥과면 대학로 113 (옥과리)', NULL, 'http://www.cntu.ac.kr', 'cntu.ac.kr', NULL, 13);
INSERT INTO public.universities VALUES (279, '전남대학교', '광주광역시 북구 용봉로 77 (용봉동, 전남대학교)', NULL, 'http://www.jnu.ac.kr', 'jnu.ac.kr', NULL, 7);
INSERT INTO public.universities VALUES (280, '전남도립대학교', '전라남도 담양군 담양읍 죽녹원로 152 (향교리, 전남도립대학)', NULL, 'http://www.dorip.ac.kr', 'dorip.ac.kr', NULL, 13);
INSERT INTO public.universities VALUES (281, '전북과학대학교', '전라북도 정읍시 정읍사로 509 (시기동, 전북과학대학)', NULL, 'http://www.jbsc.ac.kr', 'jbsc.ac.kr', NULL, 12);
INSERT INTO public.universities VALUES (282, '전북대학교', '전북 전주시 덕진구 백제대로 567', NULL, 'http://www.jbnu.ac.kr', 'jbnu.ac.kr', NULL, 12);
INSERT INTO public.universities VALUES (283, '전주교육대학교', '전라북도 전주시 완산구 서학로 50 (동서학동, 전주교육대학교)', NULL, 'http://WWW.JNUE.KR', 'jnue.kr', NULL, 12);
INSERT INTO public.universities VALUES (284, '전주기전대학', '전라북도 전주시 완산구 전주천서로 267 (중화산동1가, 전주기전대학)', NULL, 'http://www.kijeon.ac.kr', 'kijeon.ac.kr', NULL, 12);
INSERT INTO public.universities VALUES (285, '전주대학교', '전라북도 전주시 완산구 천잠로 303 (효자동2가, 전주대학교)', NULL, 'http://www.jj.ac.kr', 'jj.ac.kr', NULL, 12);
INSERT INTO public.universities VALUES (286, '전주비전대학교', '전라북도 전주시 완산구 천잠로 235 (효자동2가, 전주비전대학)', NULL, 'http://www.jvision.ac.kr', 'jvision.ac.kr', NULL, 12);
INSERT INTO public.universities VALUES (288, '정화예술대학교', '서울특별시 중구 퇴계로16길 21 (남산동1가, 정화예술대학교명동캠퍼스본관)', NULL, 'http://www.jb.ac.kr', 'jb.ac.kr', NULL, 1);
INSERT INTO public.universities VALUES (293, '조선간호대학교', '광주광역시 동구 조선대2길 70 (서석동, 조선간호대학교)', NULL, 'http://www.cnc.ac.kr', 'cnc.ac.kr', NULL, 7);
INSERT INTO public.universities VALUES (295, '조선이공대학교', '광주광역시 동구 필문대로 309-1 (서석동, 조선이공대학)', NULL, 'http://www.cst.ac.kr', 'cst.ac.kr', NULL, 7);
INSERT INTO public.universities VALUES (296, '중부대학교', '충청남도 금산군 추부면 대학로 201 (마전리, 중부대학교)', NULL, 'http://www.joongbu.ac.kr', 'joongbu.ac.kr', NULL, 11);
INSERT INTO public.universities VALUES (297, '중앙대학교', '서울특별시 동작구 흑석로 84 (흑석동, 중앙대학교)', NULL, 'http://www.cau.ac.kr', 'cau.ac.kr', NULL, 1);
INSERT INTO public.universities VALUES (299, '중원대학교', '충청북도 괴산군 괴산읍 문무로 85 (동부리, 중원대학교)', NULL, 'http://www.jwu.ac.kr', 'jwu.ac.kr', NULL, 10);
INSERT INTO public.universities VALUES (300, '진주교육대학교', '경상남도 진주시 진양호로369번길 3 (신안동, 진주교육대학교)', NULL, 'http://www.cue.ac.kr', 'cue.ac.kr', NULL, 15);
INSERT INTO public.universities VALUES (301, '진주보건대학교', '경상남도 진주시 의병로 51 (상봉동, 진주보건대학교)', NULL, 'http://www.jhc.ac.kr', 'jhc.ac.kr', NULL, 15);
INSERT INTO public.universities VALUES (302, '차의과학대학교', '경기도 포천시 해룡로 120 (동교동, 포천중문의과대학)', NULL, 'http://www.cha.ac.kr', 'cha.ac.kr', NULL, 8);
INSERT INTO public.universities VALUES (303, '창신대학교', '경상남도 창원시 마산회원구 팔용로 262 (합성동, 창신대학)', NULL, 'http://www.cs.ac.kr', 'cs.ac.kr', NULL, 15);
INSERT INTO public.universities VALUES (304, '창원문성대학교', '경상남도 창원시 성산구 충혼로 91 (두대동, 창원문성대학)', NULL, 'http://www.cmu.ac.kr', 'cmu.ac.kr', NULL, 15);
INSERT INTO public.universities VALUES (307, '청운대학교', '충청남도 홍성군 홍성읍 대학길 25 (남장리, 청운대학교)', NULL, 'http://www.chungwoon.ac.kr', 'chungwoon.ac.kr', NULL, 11);
INSERT INTO public.universities VALUES (308, '청주교육대학교', '충청북도 청주시 서원구 청남로 2065 (수곡동, 청주교육대학교)', NULL, 'http://www.cje.ac.kr', 'cje.ac.kr', NULL, 10);
INSERT INTO public.universities VALUES (309, '청주대학교', '충청북도 청주시 청원구 대성로 298 (내덕동, 청주대학교)', NULL, 'http://www.cju.ac.kr', 'cju.ac.kr', NULL, 10);
INSERT INTO public.universities VALUES (310, '초당대학교', '전라남도 무안군 무안읍 무안로 380 (성남리, 초당대학교)', NULL, 'http://www.cdu.ac.kr', 'cdu.ac.kr', NULL, 13);
INSERT INTO public.universities VALUES (311, '총신대학교', '서울특별시 동작구 사당로 143 (사당동, 총신대학교)', NULL, 'http://www.chongshin.ac.kr', 'chongshin.ac.kr', NULL, 1);
INSERT INTO public.universities VALUES (312, '추계예술대학교', '서울특별시 서대문구 북아현로11가길 7 (북아현동, 추계예술대학교)', NULL, 'http://www.chugye.ac.kr', 'chugye.ac.kr', NULL, 1);
INSERT INTO public.universities VALUES (314, '춘해보건대학교', '울산광역시 울주군 웅촌면 대학길 9 (곡천리, 춘해보건대학)', NULL, 'http://www.ch.ac.kr', 'ch.ac.kr', NULL, 6);
INSERT INTO public.universities VALUES (315, '충남대학교', '대전광역시 유성구 대학로 99 (궁동, 충남대학교)', NULL, 'http://www.cnu.ac.kr', 'cnu.ac.kr', NULL, 4);
INSERT INTO public.universities VALUES (316, '충남도립대학교', '충청남도 청양군 청양읍 학사길 55 (벽천리, 충남도립대학교)', NULL, 'http://www.cnsu.ac.kr', 'cnsu.ac.kr', NULL, 11);
INSERT INTO public.universities VALUES (317, '충북대학교', '충청북도 청주시 서원구 충대로 1 (개신동, 충북대학교)', NULL, 'http://www.chungbuk.ac.kr', 'chungbuk.ac.kr', NULL, 10);
INSERT INTO public.universities VALUES (318, '충북도립대학교', '충청북도 옥천군 옥천읍 대학길 15 (문정리, 충북도립대학교)', NULL, 'http://www.cpu.ac.kr', 'cpu.ac.kr', NULL, 10);
INSERT INTO public.universities VALUES (319, '충북보건과학대학교', '충청북도 청주시 청원구 내수읍 덕암길 10 (덕암리, 충북보건과학대학교)', NULL, 'http://www.chsu.ac.kr', 'chsu.ac.kr', NULL, 10);
INSERT INTO public.universities VALUES (320, '충청대학교', '충청북도 청주시 흥덕구 강내면 월곡길 38 (월곡리, 충청대학)', NULL, 'http://www.ok.ac.kr', 'ok.ac.kr', NULL, 10);
INSERT INTO public.universities VALUES (321, '칼빈대학교', '경기도 용인시 기흥구 마북로 184 (마북동, 칼빈대학교)', NULL, 'http://www.calvin.ac.kr', 'calvin.ac.kr', NULL, 8);
INSERT INTO public.universities VALUES (322, '태재대학교', '서울특별시 종로구 창덕궁5길 22-8 (원서동)', NULL, 'http://www.taejae.ac.kr', 'taejae.ac.kr', NULL, 1);
INSERT INTO public.universities VALUES (323, '평택대학교', '경기도 평택시 서동대로 3825 (용이동, 평택대학교)', NULL, 'http://www.ptu.ac.kr', 'ptu.ac.kr', NULL, 8);
INSERT INTO public.universities VALUES (325, '포항공과대학교', '경상북도 포항시 남구 청암로 77 (지곡동, 포항공과대학교)', NULL, 'http://www.postech.ac.kr', 'postech.ac.kr', NULL, 14);
INSERT INTO public.universities VALUES (326, '포항대학교', '경상북도 포항시 북구 흥해읍 신덕로 60 (죽천리, 포항대학교)', NULL, 'http://www.pohang.ac.kr', 'pohang.ac.kr', NULL, 14);
INSERT INTO public.universities VALUES (327, '한경국립대학교', '경기도 안성시 중앙로 327 (석정동)', NULL, 'http://www.hknu.ac.kr', 'hknu.ac.kr', NULL, 8);
INSERT INTO public.universities VALUES (329, '한국공학대학교', '경기도 시흥시 산기대학로 237 (정왕동, 한국공학대학교)', NULL, 'http://www.tukorea.ac.kr', 'tukorea.ac.kr', NULL, 8);
INSERT INTO public.universities VALUES (330, '한국과학기술원', '대전광역시 유성구 대학로 291 (구성동, 한국과학기술원)', NULL, 'http://www.kaist.ac.kr', 'kaist.ac.kr', NULL, 4);
INSERT INTO public.universities VALUES (289, '제주관광대학교', '제주특별자치도 제주시 애월읍 평화로 2715 (광령리, 제주관광대학)', NULL, 'http://www.jtu.ac.kr', 'jtu.ac.kr', NULL, 16);
INSERT INTO public.universities VALUES (290, '제주국제대학교', '제주특별자치도 제주시 516로 2870 (영평동)', NULL, 'http://www.jeju.ac.kr', 'jeju.ac.kr', NULL, 16);
INSERT INTO public.universities VALUES (305, '청강문화산업대학교', '경기도 이천시 마장면 청강가창로 389-94 (해월리, 청강문화산업대학)', NULL, 'http://www.ck.ac.kr', 'chungkang.academy', NULL, 8);
INSERT INTO public.universities VALUES (294, '조선대학교', '광주광역시 동구 조선대길 146 (서석동)', NULL, 'https://www.chosun.ac.kr', 'chosun.kr', NULL, 7);
INSERT INTO public.universities VALUES (331, '한국관광대학교', '경기도 이천시 신둔면 이장로311번길 197-73 (고척리, 한국관광대학)', NULL, 'http://www.ktc.ac.kr', 'ktc.ac.kr', NULL, 8);
INSERT INTO public.universities VALUES (333, '한국기술교육대학교', '충청남도 천안시 동남구 병천면 충절로 1600 (가전리, 한국기술교육대학교)', NULL, 'http://www.koreatech.ac.kr', 'koreatech.ac.kr', NULL, 11);
INSERT INTO public.universities VALUES (334, '한국농수산대학교', '전라북도 전주시 덕진구 콩쥐팥쥐로 1515 (중동, 국립한국농수산대학교)', NULL, 'http://www.af.ac.kr', 'af.ac.kr', NULL, 12);
INSERT INTO public.universities VALUES (335, '한국방송통신대학교', '서울특별시 종로구 대학로 86 (동숭동, 한국방송통신대학교)', NULL, 'http://www.knou.ac.kr', 'knou.ac.kr', NULL, 1);
INSERT INTO public.universities VALUES (336, '한국복지사이버대학', '경상북도 경산시 남천면 남천로 746-10 (협석리)', NULL, 'http://www.corea.ac.kr/', 'corea.ac.kr', NULL, 14);
INSERT INTO public.universities VALUES (337, '한국성서대학교', '서울특별시 노원구 동일로214길 32 (상계동, 한국성서대학교)', NULL, 'http://www.bible.ac.kr', 'bible.ac.kr', NULL, 1);
INSERT INTO public.universities VALUES (338, '한국승강기대학교', '경상남도 거창군 거창읍 운정1길 120 (송정리, 한국승강기대학)', NULL, 'http://www.klc.ac.kr', 'klc.ac.kr', NULL, 15);
INSERT INTO public.universities VALUES (339, '한국에너지공과대학교', '전라남도 나주시 켄텍길 21 (빛가람동)', NULL, 'http://www.kentech.ac.kr', 'kentech.ac.kr', NULL, 13);
INSERT INTO public.universities VALUES (340, '한국열린사이버대학교', '서울특별시 중랑구 망우로 353 (상봉동, 상봉프레미어스엠코)', NULL, 'http://www.ocu.ac.kr', 'ocu.ac.kr', NULL, 1);
INSERT INTO public.universities VALUES (341, '한국영상대학교', '세종특별자치시 장군면 대학길 300 (금암리, 한국영상대학교)', NULL, 'http://www.pro.ac.kr', 'pro.ac.kr', NULL, 25);
INSERT INTO public.universities VALUES (342, '한국예술종합학교', '서울특별시 성북구 화랑로32길 146-37 (석관동, 한국종합예술학교)', NULL, 'http://www.karts.ac.kr', 'karts.ac.kr', NULL, 1);
INSERT INTO public.universities VALUES (343, '한국외국어대학교', '서울특별시 동대문구 이문로 107 (이문동, 한국외국어대학교)', NULL, 'http://www.hufs.ac.kr', 'hufs.ac.kr', NULL, 1);
INSERT INTO public.universities VALUES (344, '한국전통문화대학교', '충청남도 부여군 규암면 백제문로 367 (합정리, 한국전통문화학교)', NULL, 'http://www.nuch.ac.kr', 'nuch.ac.kr', NULL, 11);
INSERT INTO public.universities VALUES (345, '한국체육대학교', '서울특별시 송파구 양재대로 1239 (방이동, 한국체육대학교)', NULL, 'http://www.knsu.ac.kr', 'knsu.ac.kr', NULL, 1);
INSERT INTO public.universities VALUES (346, '한국침례신학대학교', '대전광역시 유성구 북유성대로 190 (하기동, 침례신학대학교)', NULL, 'http://www.kbtus.ac.kr', 'kbtus.ac.kr', NULL, 4);
INSERT INTO public.universities VALUES (349, '한국폴리텍 I 대학 성남캠퍼스', '경기도 성남시 수정구 수정로 398 (산성동, 한국폴리텍I대학성남캠퍼스)', NULL, 'http://www.kopo.ac.kr/seongnam', 'kopo.ac.kr', NULL, 8);
INSERT INTO public.universities VALUES (351, '한국폴리텍 II 대학 남인천캠퍼스', '인천광역시 미추홀구 염전로333번길 23 (주안동, 인천직업전문학교,한국폴리텍대학)', NULL, 'http://www.kopo.ac.kr/namincheon/index.do', 'kopo.ac.kr', NULL, 3);
INSERT INTO public.universities VALUES (352, '한국폴리텍 II 대학 인천캠퍼스', '인천광역시 부평구 무네미로448번길 56 (구산동, 한국폴리텍Ⅱ대학)', NULL, 'http://www.kopo.ac.kr/incheon/index.do', 'kopo.ac.kr', NULL, 3);
INSERT INTO public.universities VALUES (353, '한국폴리텍 II 대학 화성캠퍼스', '경기도 화성시 팔탄면 제암고주로 108 (고주리, 한국폴리텍대학화성캠퍼스)', NULL, 'https://www.kopo.ac.kr/hwaseong/', 'kopo.ac.kr', NULL, 8);
INSERT INTO public.universities VALUES (357, '한국폴리텍 IV 대학 대전캠퍼스', '대전광역시 동구 우암로 352-21 (가양동, 한국폴리텍Ⅳ대학)', NULL, 'http://www.kopo.ac.kr/daejeon', 'kopo.ac.kr', NULL, 4);
INSERT INTO public.universities VALUES (358, '한국폴리텍 IV 대학 아산캠퍼스', '충청남도 아산시 신창면 행목로 45 (행목리, 한국폴리텍Ⅳ대학아산캠퍼스)', NULL, 'http://www.kopo.ac.kr/asan', 'kopo.ac.kr', NULL, 11);
INSERT INTO public.universities VALUES (359, '한국폴리텍 IV 대학 청주캠퍼스', '충청북도 청주시 흥덕구 산단로 54 (송정동, 한국폴리텍Ⅳ대학청주캠퍼스)', NULL, 'http://www.kopo.ac.kr/cheongju', 'kopo.ac.kr', NULL, 10);
INSERT INTO public.universities VALUES (360, '한국폴리텍 IV 대학 충남캠퍼스', '충청남도 홍성군 홍성읍 충서로 1200 (남장리, 한국폴리텍Ⅳ대학홍성)', NULL, 'Http://www.kopo.ac.kr/hongseong', 'kopo.ac.kr', NULL, 11);
INSERT INTO public.universities VALUES (361, '한국폴리텍 V 대학 광주캠퍼스', '광주광역시 북구 하서로 85 (운암동, 한국폴리텍V대학)', NULL, 'http://www.kopo.ac.kr/gwangju', 'kopo.ac.kr', NULL, 7);
INSERT INTO public.universities VALUES (364, '한국폴리텍 V 대학 전남캠퍼스', '전라남도 무안군 청계면 영산로 1854-16 (상마리, 한국폴리텍V대학목포캠퍼스)', NULL, 'https://www.kopo.ac.kr/jeonnam/index.do', 'kopo.ac.kr', NULL, 13);
INSERT INTO public.universities VALUES (365, '한국폴리텍 V 대학 전북캠퍼스', '전라북도 김제시 백학제길 154 (백학동, 한국폴리텍V대학)', NULL, 'https://www.kopo.ac.kr/jb/index.do', 'kopo.ac.kr', NULL, 12);
INSERT INTO public.universities VALUES (367, '한국폴리텍 VI 대학 대구캠퍼스', '대구광역시 서구 국채보상로43길 15 (평리동, 한국폴리텍6대학)', NULL, 'http://www.kopo.ac.kr/daegu', 'kopo.ac.kr', NULL, 5);
INSERT INTO public.universities VALUES (369, '한국폴리텍 VI 대학 영주캠퍼스', '경상북도 영주시 가흥로 2 (문정동, 한국폴리텍VI대학)', NULL, 'http://www.kopo.ac.kr/yeongju/index.do', 'kopo.ac.kr', NULL, 14);
INSERT INTO public.universities VALUES (370, '한국폴리텍 VII 대학 동부산캠퍼스', '부산광역시 기장군 정관읍 산단4로 2-69 (달산리, 한국폴리텍대학동부산캠퍼스)', NULL, 'http://www.kopo.ac.kr/dongbusan', 'kopo.ac.kr', NULL, 2);
INSERT INTO public.universities VALUES (371, '한국폴리텍 VII 대학 부산캠퍼스', '부산광역시 북구 만덕대로155번길 99 (덕천동, 한국폴리텍대학부산캠퍼스)', NULL, 'http://www.kopo.ac.kr/busan', 'kopo.ac.kr', NULL, 2);
INSERT INTO public.universities VALUES (372, '한국폴리텍 VII 대학 울산캠퍼스', '울산광역시 중구 산전길 155 (동동, 한국폴리텍7대학울산캠퍼스)', NULL, 'http://www.kopo.ac.kr/ulsan/index.do', 'kopo.ac.kr', NULL, 6);
INSERT INTO public.universities VALUES (374, '한국폴리텍 VII 대학 창원캠퍼스', '경상남도 창원시 성산구 외동반림로 51-88 (중앙동, 한국폴리텍대학창원캠퍼스)', NULL, 'http://www.kopo.ac.kr/changwon/index.do', 'kopo.ac.kr', NULL, 15);
INSERT INTO public.universities VALUES (375, '한국폴리텍 특성화대학 로봇캠퍼스', '경상북도 영천시 로봇캠퍼스로 1 (화룡동)', NULL, 'https://www.kopo.ac.kr/robot/index.do', 'kopo.ac.kr', NULL, 14);
INSERT INTO public.universities VALUES (377, '한국폴리텍 특성화대학 반도체융합캠퍼스', '경기도 안성시 공도읍 송원길 41-12 (만정리, 한국폴리텍대학안성캠퍼스)', NULL, 'http://www.kopo.ac.kr/semi', 'kopo.ac.kr', NULL, 8);
INSERT INTO public.universities VALUES (378, '한국폴리텍 특성화대학 항공캠퍼스', '경상남도 사천시 대학길 46 (이금동, 한국폴리텍항공대학)', NULL, 'http://www.kopo.ac.kr/kapc', 'kopo.ac.kr', NULL, 15);
INSERT INTO public.universities VALUES (380, '한남대학교', '대전광역시 대덕구 한남로 70 (오정동, 한남대학교)', NULL, 'http://www.hannam.ac.kr', 'hannam.ac.kr', NULL, 4);
INSERT INTO public.universities VALUES (350, '한국폴리텍 I 대학 제주캠퍼스', '제주특별자치도 제주시 산천단동3길 2 (아라일동, 한국폴리택대학제주캠퍼스)', NULL, 'http://www.kopo.ac.kr/jeju/index.do', 'kopo.ac.kr', NULL, 16);
INSERT INTO public.universities VALUES (379, '한국항공대학교', '경기도 고양시 덕양구 항공대학로 76 (화전동, 한국항공대학교)', NULL, 'http://www.kau.ac.kr', 'kau.kr', NULL, 8);
INSERT INTO public.universities VALUES (381, '한동대학교', '경상북도 포항시 북구 흥해읍 한동로 558 (남송리, 한동대학교)', NULL, 'http://www.handong.edu', 'handong.edu', NULL, 14);
INSERT INTO public.universities VALUES (385, '한서대학교', '충청남도 서산시 해미면 한서1로 46 (대곡리, 한서대학교)', NULL, 'http://www.hanseo.ac.kr', 'hanseo.ac.kr', NULL, 11);
INSERT INTO public.universities VALUES (386, '한성대학교', '서울특별시 성북구 삼선교로16길 116 (삼선동2가, 한성대학교)', NULL, 'http://www.hansung.ac.kr', 'hansung.ac.kr', NULL, 1);
INSERT INTO public.universities VALUES (387, '한세대학교', '경기도 군포시 한세로 30 (당정동, 한세대학교)', NULL, 'http://www.hansei.ac.kr', 'hansei.ac.kr', NULL, 8);
INSERT INTO public.universities VALUES (388, '한신대학교', '경기도 오산시 한신대길 137 (양산동, 한신대학교)', NULL, 'http://www.hs.ac.kr', 'hs.ac.kr', NULL, 8);
INSERT INTO public.universities VALUES (389, '한양대학교', '서울특별시 성동구 왕십리로 222 (사근동, 한양대학교)', NULL, 'http://www.hanyang.ac.kr', 'hanyang.ac.kr', NULL, 1);
INSERT INTO public.universities VALUES (390, '한양대학교 ERICA캠퍼스', '경기도 안산시 상록구 한양대학로 55 (사동, 한양대학교)', NULL, 'http://www.hanyang.ac.kr/', 'hanyang.ac.kr', NULL, 8);
INSERT INTO public.universities VALUES (391, '한양사이버대학교', '서울특별시 성동구 왕십리로 220 (행당동, 한양사이버대학교)', NULL, 'http://www.hycu.ac.kr', 'hycu.ac.kr', NULL, 1);
INSERT INTO public.universities VALUES (392, '한양여자대학교', '서울특별시 성동구 살곶이길 200 (사근동, 한양여자대학)', NULL, 'http://www.hywoman.ac.kr', 'hywoman.ac.kr', NULL, 1);
INSERT INTO public.universities VALUES (393, '한영대학교', '전라남도 여수시 장군산길 18-43 (여서동, 한영대학)', NULL, 'http://www.hanyeong.ac.kr', 'hanyeong.ac.kr', NULL, 13);
INSERT INTO public.universities VALUES (394, '한일장신대학교', '전라북도 완주군 상관면 왜목로 726-15 (신리, 한일장신대학교)', NULL, 'http://www.hanil.ac.kr', 'hanil.ac.kr', NULL, 12);
INSERT INTO public.universities VALUES (395, '협성대학교', '경기도 화성시 봉담읍 최루백로 72 (상리, 협성대학교)', NULL, 'http://www.uhs.ac.kr', 'uhs.ac.kr', NULL, 8);
INSERT INTO public.universities VALUES (396, '혜전대학교', '충청남도 홍성군 홍성읍 대학1길 19 (남장리)', NULL, 'http://www.hj.ac.kr', 'hj.ac.kr', NULL, 11);
INSERT INTO public.universities VALUES (397, '호남대학교', '광주광역시 광산구 호남대길 120 (서봉동, 호남대학본부)', NULL, 'http://www.honam.ac.kr', 'honam.ac.kr', NULL, 7);
INSERT INTO public.universities VALUES (398, '호남신학대학교', '광주광역시 남구 제중로 77 (양림동, 호남신학대학교)', NULL, 'http://www.htus.ac.kr', 'htus.ac.kr', NULL, 7);
INSERT INTO public.universities VALUES (399, '호산대학교', '경상북도 경산시 하양읍 대경로105길 19 (부호리, 호산대학교)', NULL, 'http://www.hosan.ac.kr', 'hosan.ac.kr', NULL, 14);
INSERT INTO public.universities VALUES (401, '호원대학교', '전라북도 군산시 임피면 호원대3길 64 (월하리, 호원대학교)', NULL, 'http://www.howon.ac.kr', 'howon.ac.kr', NULL, 12);
INSERT INTO public.universities VALUES (402, '홍익대학교', '서울특별시 마포구 와우산로 94 (상수동, 홍익대학교)', NULL, 'http://www.hongik.ac.kr/', 'hongik.ac.kr', NULL, 1);
INSERT INTO public.universities VALUES (403, '화성의과학대학교', '경기도 화성시 남양읍 남양중앙로 400-5 (남양리, 신경대학교)', NULL, 'https://www.hsmu.ac.kr/sgu_main/index.do', 'hsmu.ac.kr', NULL, 8);
INSERT INTO public.universities VALUES (404, '화신사이버대학교', '부산광역시 연제구 고분로191번길 1 (연산동, 화신사이버대학교)', NULL, 'http://www.hscu.ac.kr', 'hscu.ac.kr', NULL, 2);
INSERT INTO public.universities VALUES (10, '가톨릭관동대학교', '강원도 강릉시 범일로579번길 24 (내곡동, 가톨릭관동대학교)', NULL, 'https://www.cku.ac.kr/cku/index.do#none', 'cku.ac.kr', NULL, 9);
INSERT INTO public.universities VALUES (17, '강릉영동대학교', '강원도 강릉시 공제로 357 (홍제동, 강릉영동대학)', NULL, 'http://www.gyu.ac.kr', 'gyu.ac.kr', NULL, 9);
INSERT INTO public.universities VALUES (19, '강원관광대학교', '강원도 태백시 대학길 97 (황지동, 강원관광대학)', NULL, 'http://www.kt.ac.kr', 'kt.ac.kr', NULL, 9);
INSERT INTO public.universities VALUES (20, '강원대학교', '강원도 춘천시 강원대학길 1 (효자동, 강원대학교)', NULL, 'http://www.kangwon.ac.kr/', 'kangwon.ac.kr', NULL, 9);
INSERT INTO public.universities VALUES (21, '강원도립대학교', '강원도 강릉시 주문진읍 연주로 270 (교항리, 강원도립대학)', NULL, 'http://www.gw.ac.kr', 'gw.ac.kr', NULL, 9);
INSERT INTO public.universities VALUES (33, '경동대학교', '강원도 고성군 토성면 봉포4길 46 (봉포리, 경동대학교)', NULL, 'http://www.kduniv.ac.kr', 'kduniv.ac.kr', NULL, 9);
INSERT INTO public.universities VALUES (67, '국립강릉원주대학교', '강원도 강릉시 죽헌길 7 (지변동, 강릉원주대학교)', NULL, 'http://www.gwnu.ac.kr', 'gwnu.ac.kr', NULL, 9);
INSERT INTO public.universities VALUES (173, '상지대학교', '강원도 원주시 상지대길 83 (우산동, 상지대학교)', NULL, 'http://www.sangji.ac.kr', 'sangji.ac.kr', NULL, 9);
INSERT INTO public.universities VALUES (201, '세경대학교', '강원도 영월군 영월읍 하송로 197 (하송리, 세경대학)', NULL, 'http://www.saekyung.ac.kr', 'saekyung.ac.kr', NULL, 9);
INSERT INTO public.universities VALUES (207, '송곡대학교', '강원도 춘천시 남산면 송곡대학길 34 (창촌리, 송곡대학교)', NULL, 'http://www.songgok.ac.kr', 'songgok.ac.kr', NULL, 9);
INSERT INTO public.universities VALUES (209, '송호대학교', '강원도 횡성군 횡성읍 남산로 210 (남산리, 송호대학교)', NULL, 'http://www.songho.ac.kr', 'songho.ac.kr', NULL, 9);
INSERT INTO public.universities VALUES (237, '연세대학교 미래캠퍼스', '강원도 원주시 흥업면 연세대길 1 (매지리, 연세대학교)', NULL, 'http://www.yonsei.ac.kr/wj', 'yonsei.ac.kr', NULL, 9);
INSERT INTO public.universities VALUES (313, '춘천교육대학교', '강원도 춘천시 공지로 126 (석사동, 춘천교육대학교)', NULL, 'http://www.cnue.ac.kr', 'cnue.ac.kr', NULL, 9);
INSERT INTO public.universities VALUES (328, '한국골프대학교', '강원도 횡성군 우천면 하대5길 109 (하대리, 한국골프대학교)', NULL, 'http://www.kg.ac.kr/', 'kg.ac.kr', NULL, 9);
INSERT INTO public.universities VALUES (354, '한국폴리텍 III 대학 강릉캠퍼스', '강원도 강릉시 남산초교길 121 (노암동, 한국폴리텍3대학)', NULL, 'http://www.kopo.ac.kr/gangneung', 'kopo.ac.kr', NULL, 9);
INSERT INTO public.universities VALUES (355, '한국폴리텍 III 대학 원주캠퍼스', '강원도 원주시 북원로2425번길 73 (우산동, 한국폴리텍3대학)', NULL, 'http://www.kopo.ac.kr/wonju', 'kopo.ac.kr', NULL, 9);
INSERT INTO public.universities VALUES (356, '한국폴리텍 III 대학 춘천캠퍼스', '강원도 춘천시 동산면 영서로 1290-31 (원창리, 한국폴리텍Ⅲ대학)', NULL, 'http://www.kopo.ac.kr/chuncheon/', 'kopo.ac.kr', NULL, 9);
INSERT INTO public.universities VALUES (382, '한라대학교', '강원도 원주시 흥업면 한라대길 28 (흥업리, 한라대학교)', NULL, 'http://www.halla.ac.kr', 'halla.ac.kr', NULL, 9);
INSERT INTO public.universities VALUES (383, '한림대학교', '강원도 춘천시 한림대학길 1 (옥천동, 한림대학교)', NULL, 'http://www.hallym.ac.kr', 'hallym.ac.kr', NULL, 9);
INSERT INTO public.universities VALUES (384, '한림성심대학교', '강원도 춘천시 동면 장학길 48 (장학리, 한림성심대학교)', NULL, 'http://www.hsc.ac.kr', 'hsc.ac.kr', NULL, 9);
INSERT INTO public.universities VALUES (291, '제주대학교', '제주특별자치도 제주시 제주대학로 102 (아라일동, 제주대학교)', NULL, 'http://www.jejunu.ac.kr', 'jejunu.ac.kr', NULL, 16);
INSERT INTO public.universities VALUES (292, '제주한라대학교', '제주특별자치도 제주시 한라대학로 38 (노형동, 제주한라대학)', NULL, 'http://www.chu.ac.kr', 'chu.ac.kr', NULL, 16);
INSERT INTO public.universities VALUES (236, '연세대학교', '서울특별시 서대문구 연세로 50 (신촌동, 연세대학교)', NULL, 'http://www.yonsei.ac.kr', 'yonsei.ac.kr', 'https://uniwiki-bucket.s3.ap-northeast-2.amazonaws.com/uni-logo/%EC%97%B0%EC%84%B8%EB%8C%80%ED%95%99%EA%B5%90.png', 1);
INSERT INTO public.universities VALUES (5, 'ICT폴리텍대학', '경기도 광주시 순암로 16-26 (역동, ICT폴리텍대학)', NULL, 'http://www.ict.ac.kr', 'ict.ac.kr', 'https://uniwiki-bucket.s3.ap-northeast-2.amazonaws.com/uni-logo/ICT%ED%8F%B4%EB%A6%AC%ED%85%8D%EB%8C%80%ED%95%99%EA%B5%90.png', 8);
INSERT INTO public.universities VALUES (400, '호서대학교', '충청남도 아산시 배방읍 호서로79번길 20 (세출리, 호서대학교)', NULL, 'http://www.hoseo.ac.kr', 'hoseo.edu', NULL, 11);


--
-- TOC entry 3396 (class 0 OID 0)
-- Dependencies: 219
-- Name: categories_category_id_seq; Type: SEQUENCE SET; Schema: public; Owner: d104
--

SELECT pg_catalog.setval('public.categories_category_id_seq', 6, true);


--
-- TOC entry 3397 (class 0 OID 0)
-- Dependencies: 211
-- Name: code_groups_code_group_id_seq; Type: SEQUENCE SET; Schema: public; Owner: d104
--

SELECT pg_catalog.setval('public.code_groups_code_group_id_seq', 1, false);


--
-- TOC entry 3398 (class 0 OID 0)
-- Dependencies: 213
-- Name: codes_code_id_seq; Type: SEQUENCE SET; Schema: public; Owner: d104
--

SELECT pg_catalog.setval('public.codes_code_id_seq', 1, false);


--
-- TOC entry 3399 (class 0 OID 0)
-- Dependencies: 209
-- Name: regions_region_id_seq; Type: SEQUENCE SET; Schema: public; Owner: d104
--

SELECT pg_catalog.setval('public.regions_region_id_seq', 26, true);


--
-- TOC entry 3400 (class 0 OID 0)
-- Dependencies: 215
-- Name: universities_university_id_seq; Type: SEQUENCE SET; Schema: public; Owner: d104
--

SELECT pg_catalog.setval('public.universities_university_id_seq', 404, true);


-- Completed on 2025-11-20 09:21:44

--
-- PostgreSQL database dump complete
--

\unrestrict PHRDXjJwxRNbbacdMaqzBLFABaUckuqbz1oXCHyIEF1KqOt8unQy3IUycRa4kcx

