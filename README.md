# 🧑‍🎓 유니위키 (UniWiki)

> **“대학생들의 손으로 완성되는 대학 정보 백과사전”**  
> 대학생들이 함께 만들어가는 지식 공유 위키 플랫폼

<br>

---

## 📑 목차
1. [📋 프로젝트 소개](#-프로젝트-소개)
2. [🚀 주요 기능](#-주요-기능)
3. [🖥️ 화면 구조](#-화면-구조)
4. [🛠️ 기술 스택](#-기술-스택)
5. [🏗️ 아키텍처](#️-아키텍처)
6. [📚 ERD](#-erd)
7. [👨‍👩‍👧‍👦 팀원 정보](#-팀원-정보)

<br>

---

## 📋 프로젝트 소개

| 항목        | 내용                                                                   |
| --------- | -------------------------------------------------------------------- |
| **프로젝트명** | 유니위키 (UniWiki)                                                       |
| **목표**    | 대학생들이 학교, 학과, 강의, 시설, 행사 등과 관련된 정보를 공동으로 작성·수정·검색할 수 있는 지식 공유 플랫폼 구축 |
| **핵심 기능** | 위키 문서 시스템, 버전 관리, 학교 인증 기반 사용자 시스템, 문서 추천/신고, 통합 검색, 토론 기능           |

<br>

---

## 🚀 주요 기능
1. **문서 작성/버전 관리 시스템**
    - 소속 대학의 문서 작성/편집
    - 문서의 편집 역사를 버전으로 관리
2. **RAG 기반 검색**
    - RAG를 통한 위키 내 문서를 기반 AI 검색 기능
3. **토론**
    - 문서 파생 토론을 통해 학생 간 합의 가능
4. **관리자**
    - 전반적인 문서 관리
    - 유저/토론 신고 처리

<br>

---

## 🖥️ 화면 구조

### 메인 페이지
<p align="center">
  <img src="/img/일반_메인.png" width="30%">
  <img src="/img/일반_매뉴얼.png" width="30%">
</p>

#### 회원가입
<p align="center">
  <img src="/img/회원가입.png" width="30%">
</p>

##### 회원가입 인증
<p align="center">
  <img src="/img/회원가입_인증대기.png" width="30%">
  <img src="/img/회원가입_코드.png" width="30%">
  <img src="/img/회원가입_인증완.png" width="30%">
</p>

##### 회원 정보 기입
<p align="center">
  <img src="/img/회원가입_정보기입.png" width="30%">
  <img src="/img/회원가입완.png" width="30%">
</p>


#### 로그인
<p align="center">
  <img src="/img/일반_로그인.png" width="30%">
  <img src="/img/유저_메인.png" width="30%">
</p>

### 대학 페이지
<p align="center">
  <img src="/img/대학_메인.png" width="30%">
  <img src="/img/문서_목록.png" width="30%">
</p>

### 문서
#### 문서 작성
<p align="center">
  <img src="/img/문서_작성.png" width="30%">
  <img src="/img/문서_이미지.png" width="30%">
  <img src="/img/문서_작성완.png" width="30%">
</p>

#### 문서 역사
<p align="center">
  <img src="/img/문서_역사.png" width="30%">
  <img src="/img/문서_버전보기.png" width="30%">
  <img src="/img/문서_변경내역.png" width="30%">
  <img src="/img/문서_버전돌리기.png" width="30%">
  <img src="/img/문서_버전돌리기완.png" width="30%">
</p>

### 토론
<p align="center">
  <img src="/img/토론_생성.png" width="30%">
   <img src="/img/토론_생성완.png" width="30%">
   <img src="/img/토론_목록.png" width="30%">
   <img src="/img/토론_진행.png" width="30%">
   <img src="/img/토론_종료.png" width="30%">
</p>

### 유저
<p align="center">
  <img src="/img/유저_정보.png" width="30%">
</p>

#### 즐겨찾기
<p align="center">
  <img src="/img/유저_즐겨찾기대학.png" width="30%">
  <img src="/img/유저_즐겨찾기문서.png" width="30%">
</p>

#### 기여 목록
<p align="center">
  <img src="/img/유저_참여문서.png" width="30%">
  <img src="/img/유저_참여토론.png" width="30%">
</p>

### 관리자
#### 문서 검색 및 관리
<p align="center">
  <img src="/img/관리자_문서관리.png" width="30%">
</p>

#### 유저 신고 처리
<p align="center">
  <img src="/img/관리자_유저신고.png" width="30%">
  <img src="/img/관리자_유저차단.png" width="30%">
  <img src="/img/관리자_유저기각.png" width="30%">
</p>

#### 토론 관리
<p align="center">
  <img src="/img/관리자_토론신고.png" width="30%">
  <img src="/img/관리자_오래된토론.png" width="30%">
</p>

<br>

---

## 🛠️ 기술 스택

### 💻 프론트
![Typescript](https://img.shields.io/badge/TypeScript-3178C6.svg?style=for-the-badge&logo=TypeScript&logoColor=white)
![CSS](https://img.shields.io/badge/css-663399.svg?style=for-the-badge&logo=css&logoColor=white)
![HTML5](https://img.shields.io/badge/html5-E34F26.svg?style=for-the-badge&logo=html5&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB.svg?style=for-the-badge&logo=react&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind%20CSS-06B6D4.svg?style=for-the-badge&logo=tailwindcss&logoColor=white)



### ⚙️ 백엔드 (Spring Boot)
![Java](https://img.shields.io/badge/java-%23ED8B00.svg?style=for-the-badge&logo=openjdk&logoColor=white)
![SpringBoot](https://img.shields.io/badge/SpringBoot-6DB33F?style=for-the-badge&logo=Spring&logoColor=white)
![Gradle](https://img.shields.io/badge/Gradle-02303A.svg?style=for-the-badge&logo=Gradle&logoColor=white)
![YAML](https://img.shields.io/badge/yaml-black.svg?style=for-the-badge&logo=yaml&logoColor=white)

### 🗄️ 데이터베이스
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1.svg?style=for-the-badge&logo=PostgreSQL&logoColor=white)
![Redis](https://img.shields.io/badge/redis-%23DD0031.svg?style=for-the-badge&logo=redis&logoColor=white)
![Amazon S3](https://img.shields.io/badge/Amazon%20S3-FF9900?style=for-the-badge&logo=amazons3&logoColor=white)
![ElasticSearch](https://img.shields.io/badge/elasticsearch-005571?style=for-the-badge&logo=elasticsearch&logoColor=white)

### ☁️ 인프라
![AWS](https://img.shields.io/badge/AWS-%23FF9900.svg?style=for-the-badge&logo=amazon-aws&logoColor=white)
![Ubuntu](https://img.shields.io/badge/Ubuntu-E95420?style=for-the-badge&logo=ubuntu&logoColor=white)
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)
![Docker Compose](https://img.shields.io/badge/docker_compose-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)
![Jenkins](https://img.shields.io/badge/jenkins-%232C5263.svg?style=for-the-badge&logo=jenkins&logoColor=white)
![Nginx](https://img.shields.io/badge/nginx-%23009639.svg?style=for-the-badge&logo=nginx&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens)


### 👊 협업 툴
![Git](https://img.shields.io/badge/git-%23F05033.svg?style=for-the-badge&logo=git&logoColor=white)
![GitLab](https://img.shields.io/badge/gitlab-%23181717.svg?style=for-the-badge&logo=gitlab&logoColor=white)
![Jira](https://img.shields.io/badge/jira-%230A0FFF.svg?style=for-the-badge&logo=jira&logoColor=white)
![Figma](https://img.shields.io/badge/figma-%23F24E1E.svg?style=for-the-badge&logo=figma&logoColor=white)
![Mattermost](https://img.shields.io/badge/Mattermost-0285FF?style=for-the-badge&logo=Mattermost&logoColor=white)
![Notion](https://img.shields.io/badge/Notion-%23000000.svg?style=for-the-badge&logo=notion&logoColor=white)
![KakaoTalk](https://img.shields.io/badge/kakaotalk-ffcd00.svg?style=for-the-badge&logo=kakaotalk&logoColor=000000)

### ✍️ IDE & 편집툴
![IntelliJ IDEA](https://img.shields.io/badge/IntelliJ%20IDEA-000000.svg?style=for-the-badge&logo=intellij-idea&logoColor=white)
![Visual Studio Code](https://img.shields.io/badge/Visual%20Studio%20Code-0078D4.svg?style=for-the-badge&logo=visual-studio-code&logoColor=white)

---

## 🏗️ 아키텍처
![architecture](/img/인프라.png)

---

## 📚 ERD
![erd](/img/UNIWIKI_schema.png)

---

## 👨‍👩‍👧‍👦 팀원 정보

| 🧑‍💻 **이름**    | 🏆 **역할**        | 🚀 **이메일주소**        |
|:----------------:|:-----------------:|:-----------------------:|
| **김소은**       | 백엔드           |  prgrm0505@gmail.com  |
| **김하은**       | 백엔드/AI        |  siji2135@naver.com |
| **박상훈**       | 프론트엔드       |   empty@gmail.com
| **이지오**       | 프론트엔드       | empty@gmail.com |
| **손초희**       | 백엔드/인프라    | schabc8436@gmail.com |
| **최혜정**       | 프론트엔드       |  empty@gmail.com |

<br>

---
