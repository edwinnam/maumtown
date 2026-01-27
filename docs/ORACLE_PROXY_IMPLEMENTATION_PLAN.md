# 🎯 Oracle Proxy SMS 서버 복구 및 Maumtown 통합 구현 계획

**작성일**: 2026-01-26
**목표**: MINDSONATA에 영향 없이 Maumtown이 동일한 Oracle Proxy를 사용하여 SMS 발송

---

## 📊 현황 분석

### 1. Oracle Cloud 서버 정보
```
서버 IP: 144.24.89.164
SSH 접속: ssh -i "C:\Users\msi\Documents\소프트웨어개발\Oracle Server\ssh-key-2025-07-07.key" ubuntu@144.24.89.164
서버 위치: ~/sms-server/server.js
PM2 관리: sudo pm2로 실행 필요
```

### 2. 도메인 설정
```
- https://sms.ibpitest.com → Oracle 서버 (144.24.89.164) ✅
- https://sms.mindsonata.com → 현재 Vercel (216.150.x.x) ❌ 문제!
```

### 3. 현재 문제점

#### 🔴 문제 1: SSL 인증서 권한 오류
```
Error: EACCES: permission denied, open '/etc/letsencrypt/live/sms.ibpitest.com/privkey.pem'
```
- **원인**: PM2가 일반 사용자 권한으로 실행되어 SSL 인증서 접근 불가
- **해결**: sudo pm2로 실행 필요

#### 🔴 문제 2: DNS 설정 오류
```
sms.mindsonata.com → 216.150.1.193 (Vercel) ❌
```
- **원인**: DNS가 Vercel을 가리키고 있어 Oracle 서버에 도달 불가
- **해결**: DNS를 144.24.89.164로 변경 필요

#### 🔴 문제 3: MINDSONATA SMS 발송 실패
```
supabase/functions/sms-proxy/index.ts:
  fetch('https://sms.mindsonata.com/api/send-sms') → 404 오류
```
- **원인**: DNS 문제로 Oracle 프록시 서버에 도달 불가
- **영향**: MINDSONATA의 모든 SMS 발송 실패

---

## 🎯 해결 방안

### 방안 1: Oracle 서버 복구 + DNS 수정 (권장)

**장점**:
- ✅ MINDSONATA와 maumtown 모두 동일한 고정 IP 프록시 사용
- ✅ Aligo IP 등록 1개만 필요 (144.24.89.164)
- ✅ Supabase IP 변경 문제 완전 해결
- ✅ 안정적이고 지속 가능한 솔루션

**단점**:
- ⚠️ DNS 변경 필요 (propagation 시간 필요)
- ⚠️ SSL 인증서 갱신 관리 필요

### 방안 2: Supabase IP 범위 등록

**장점**:
- ✅ 즉시 적용 가능
- ✅ 서버 관리 불필요

**단점**:
- ❌ 8개 이상의 IP 대역 등록 필요
- ❌ 새로운 IP 추가 시 수동 등록 필요
- ❌ 장기적으로 관리 부담

---

## 📋 구현 계획 (방안 1 - 권장)

### Phase 1: Oracle 서버 복구 ⏱️ 10분

#### 1.1 SSL 인증서 권한 문제 해결

```bash
# SSH 접속
ssh -i "C:\Users\msi\Documents\소프트웨어개발\Oracle Server\ssh-key-2025-07-07.key" ubuntu@144.24.89.164

# 현재 PM2 프로세스 정리
pm2 delete sms-server 2>/dev/null
sudo pm2 delete sms-server 2>/dev/null

# sudo로 서버 시작
cd ~/sms-server
sudo pm2 start server.js --name sms-server

# 상태 확인
sudo pm2 status
sudo pm2 logs sms-server --lines 20
```

#### 1.2 부팅 시 자동 시작 설정

```bash
# PM2 startup 설정
sudo pm2 startup systemd -u ubuntu --hp /home/ubuntu

# 현재 프로세스 저장
sudo pm2 save

# 재부팅 후에도 자동 시작됨
```

#### 1.3 서버 동작 확인

```bash
# 로컬 테스트 (서버에서)
curl http://localhost/health

# 외부 접근 테스트 (로컬 PC에서)
curl http://144.24.89.164/health

# 예상 응답
{"status":"ok","message":"SMS server is running"}
```

### Phase 2: DNS 설정 변경 ⏱️ 5분 (+ propagation 시간)

#### 2.1 DNS 레코드 확인

현재:
```
sms.mindsonata.com → 216.150.1.193 (Vercel)
```

변경 필요:
```
sms.mindsonata.com → 144.24.89.164 (Oracle)
```

#### 2.2 DNS 변경 방법

**도메인 관리 페이지 접속** (mindsonata.com 등록된 곳):
- 가비아, 카페24, AWS Route53, Cloudflare 등

**A 레코드 수정**:
```
Type: A
Name: sms
Value: 144.24.89.164
TTL: 300 (5분)
```

**기존 레코드 삭제**:
- Vercel 관련 CNAME 레코드 삭제

#### 2.3 DNS Propagation 대기

```bash
# DNS 변경 확인 (로컬 PC에서 반복 실행)
nslookup sms.mindsonata.com

# 기대 결과
Address: 144.24.89.164
```

보통 5-30분 소요 (최대 48시간)

### Phase 3: HTTPS 도메인 테스트 ⏱️ 5분

#### 3.1 HTTPS 접속 테스트

```bash
# Health check
curl https://sms.mindsonata.com/health

# SMS API 테스트
curl -X POST https://sms.mindsonata.com/api/send-sms \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "01012345678",
    "message": "테스트 메시지",
    "sender": "028511934",
    "msg_type": "SMS",
    "testmode_yn": "Y"
  }'
```

#### 3.2 SSL 인증서 확인

```bash
# SSL 인증서 유효성 확인
openssl s_client -connect sms.mindsonata.com:443 -servername sms.mindsonata.com < /dev/null

# 인증서 만료일 확인
echo | openssl s_client -servername sms.mindsonata.com -connect sms.mindsonata.com:443 2>/dev/null | openssl x509 -noout -dates
```

### Phase 4: Maumtown Edge Function 수정 ⏱️ 5분

#### 4.1 maumtown-contact Edge Function 최종 버전

**이미 구현된 코드 (수정 불필요)**:
```typescript
// C:\projects\MINDSONATA\supabase\functions\maumtown-contact\index.ts
const aligoResponse = await fetch('https://sms.mindsonata.com/api/send-sms', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    phone: RECEIVER_PHONE,
    message: smsMessage,
    sender: SENDER_PHONE,
    msg_type: 'LMS',
    title: '마음동네 상담 신청',
    testmode_yn: 'N',
  }),
})
```

**이미 배포됨** ✅

### Phase 5: 통합 테스트 ⏱️ 10분

#### 5.1 MINDSONATA SMS 테스트

```bash
# MINDSONATA 로그인 후 SMS 발송 테스트
# http://localhost:5177/test/sms
```

**예상 결과**:
```json
{
  "success": true,
  "result": {
    "result_code": "1",
    "message": "성공"
  }
}
```

#### 5.2 Maumtown SMS 테스트

```bash
# 브라우저에서 mindhealth-support.html 열기
# 상담 신청 폼 제출
```

**예상 결과**:
```json
{
  "success": true,
  "message": "상담 신청이 접수되었습니다.",
  "sms_result": {
    "result_code": "1",
    "message": "성공"
  }
}
```

#### 5.3 실제 SMS 수신 확인

- 010-2539-1007 번호로 실제 SMS 수신 확인

---

## 🔧 문제 해결 가이드

### 문제 A: DNS 변경이 적용되지 않음

**확인**:
```bash
nslookup sms.mindsonata.com
# 여전히 216.150.x.x를 가리키면 DNS propagation 진행 중
```

**임시 해결 (테스트용)**:
```typescript
// Edge Function에서 IP 직접 사용
const aligoResponse = await fetch('http://144.24.89.164/api/send-sms', {
  // ... 동일
})
```

**주의**: HTTP 사용 시 SSL 없음

### 문제 B: SSL 인증서 만료

**확인**:
```bash
ssh ubuntu@144.24.89.164
sudo certbot certificates
```

**갱신**:
```bash
sudo certbot renew
sudo pm2 restart sms-server
```

### 문제 C: Oracle 서버가 중지됨

**확인**:
```bash
ssh ubuntu@144.24.89.164
sudo pm2 status
```

**재시작**:
```bash
sudo pm2 restart sms-server
sudo pm2 logs sms-server
```

### 문제 D: Aligo IP 인증 오류 (-101)

**확인**:
- Oracle 서버 IP가 Aligo에 등록되어 있는지 확인

**해결**:
1. Aligo 관리자 페이지 접속: https://smartsms.aligo.in/admin
2. IP 관리 메뉴 → 144.24.89.164 등록
3. 또는 대역: 144.24.89 (0-255 자동 커버)

---

## 📊 최종 아키텍처

### 완성된 SMS 발송 흐름

```
┌─────────────────────────────────────────────────────────────┐
│                    MINDSONATA 프로젝트                        │
│                                                               │
│  Browser → Supabase Edge Function (sms-proxy)                │
│             ↓ (사용자 인증 필요)                               │
│             └─→ https://sms.mindsonata.com/api/send-sms      │
│                                                               │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                     Maumtown 프로젝트                         │
│                                                               │
│  Browser → Supabase Edge Function (maumtown-contact)         │
│             ↓ (공개 API, x-api-key 검증)                      │
│             └─→ https://sms.mindsonata.com/api/send-sms      │
│                                                               │
└─────────────────────────────────────────────────────────────┘

                              ↓ ↓

┌─────────────────────────────────────────────────────────────┐
│              Oracle Cloud SMS Proxy Server                   │
│              (고정 IP: 144.24.89.164)                         │
│                                                               │
│  - 도메인: https://sms.mindsonata.com                         │
│  - SSL: Let's Encrypt                                         │
│  - PM2: sudo pm2 start server.js --name sms-server           │
│  - 자동 시작: systemd                                          │
│                                                               │
└─────────────────────────────────────────────────────────────┘

                              ↓

┌─────────────────────────────────────────────────────────────┐
│                   Aligo SMS API                              │
│              (https://apis.aligo.in/send/)                   │
│                                                               │
│  - 등록된 IP: 144.24.89.164                                   │
│  - 발신번호: 028511934                                         │
│  - 최종 SMS 발송                                               │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### 핵심 특징

1. **단일 Oracle 프록시 서버**
   - MINDSONATA와 maumtown 모두 동일한 서버 사용
   - 고정 IP로 Aligo IP 인증 문제 해결
   - 서로 영향 없이 독립적으로 작동

2. **보안**
   - MINDSONATA: Supabase 사용자 인증 (JWT) 필요
   - Maumtown: x-api-key 헤더로 간단한 인증
   - HTTPS/SSL 암호화 통신

3. **안정성**
   - PM2 프로세스 관리
   - 시스템 재부팅 시 자동 시작
   - Oracle Free Tier 무료 사용

---

## ✅ 체크리스트

### Oracle 서버 복구
- [ ] SSH 접속 성공
- [ ] sudo pm2 start server.js --name sms-server 실행
- [ ] sudo pm2 save 실행
- [ ] sudo pm2 startup 설정
- [ ] http://144.24.89.164/health 응답 확인
- [ ] sudo pm2 logs sms-server 정상 확인

### DNS 설정 변경
- [ ] 도메인 관리 페이지 접속
- [ ] sms.mindsonata.com A 레코드 → 144.24.89.164
- [ ] 기존 Vercel CNAME 삭제
- [ ] nslookup sms.mindsonata.com 확인 (144.24.89.164)
- [ ] https://sms.mindsonata.com/health 접속 성공

### Aligo IP 등록
- [ ] https://smartsms.aligo.in/admin 접속
- [ ] IP 관리 → 144.24.89.164 등록
- [ ] 또는 144.24.89 대역 등록

### MINDSONATA 테스트
- [ ] http://localhost:5177/test/sms 접속
- [ ] SMS 발송 테스트
- [ ] result_code: "1" 성공 확인
- [ ] 실제 SMS 수신 확인 (테스트 모드 OFF 시)

### Maumtown 테스트
- [ ] mindhealth-support.html 폼 제출
- [ ] 브라우저 콘솔 SUCCESS! 확인
- [ ] 010-2539-1007 실제 SMS 수신 확인

### 최종 확인
- [ ] MINDSONATA SMS 발송 정상
- [ ] Maumtown SMS 발송 정상
- [ ] 두 프로젝트 상호 영향 없음
- [ ] Oracle 서버 안정 운영 (sudo pm2 status)

---

## 📅 예상 소요 시간

| 단계 | 작업 | 소요 시간 |
|------|------|----------|
| Phase 1 | Oracle 서버 복구 | 10분 |
| Phase 2 | DNS 설정 변경 | 5분 |
| Phase 2 | DNS Propagation 대기 | 5-30분 |
| Phase 3 | HTTPS 테스트 | 5분 |
| Phase 4 | Edge Function 확인 | 5분 |
| Phase 5 | 통합 테스트 | 10분 |
| **합계** | | **40-65분** |

---

## 🚨 주의사항

### MINDSONATA 프로젝트 영향 최소화

1. **기존 코드 수정 불필요**
   - MINDSONATA의 sms-proxy Edge Function은 수정 불필요
   - 이미 https://sms.mindsonata.com/api/send-sms 호출 중

2. **DNS 변경 시 주의**
   - DNS propagation 중에는 MINDSONATA SMS 발송 불안정
   - 가능하면 사용량이 적은 시간대에 작업
   - 긴급 SMS 발송 예정이면 작업 연기

3. **Oracle 서버 관리**
   - sudo pm2로 실행 필수 (SSL 인증서 접근)
   - 주기적인 상태 확인 (sudo pm2 status)
   - SSL 인증서 만료 전 갱신 (90일마다)

4. **Aligo IP 등록**
   - 144.24.89.164 또는 144.24.89 대역 등록
   - 등록 후 1-2분 대기 (설정 반영 시간)

---

## 📞 문제 발생 시 연락처

**Oracle 서버 접속 정보**:
- IP: 144.24.89.164
- 계정: ubuntu
- SSH Key: `C:\Users\msi\Documents\소프트웨어개발\Oracle Server\ssh-key-2025-07-07.key`

**Oracle Cloud 계정**:
- Email: edwinnam@hanmail.net
- Password: (별도 보관)

**Aligo 계정**:
- ID: edwinnam
- 관리자: https://smartsms.aligo.in/admin

**도메인 관리**:
- mindsonata.com 등록 업체 확인 필요

---

## 🎉 완료 후 기대 효과

1. ✅ **MINDSONATA SMS 발송 재개**
   - 현재 404 오류 해결
   - 안정적인 SMS/카카오톡 발송

2. ✅ **Maumtown SMS 발송 가능**
   - 010-2539-1007로 상담 신청 알림 자동 발송
   - Supabase IP 변경 문제 완전 해결

3. ✅ **고정 IP 프록시 아키텍처**
   - Aligo IP 등록 1개만 필요
   - 장기적으로 안정적인 솔루션
   - Oracle Free Tier 무료 사용

4. ✅ **두 프로젝트 독립성 유지**
   - MINDSONATA: 사용자 인증 기반
   - Maumtown: API 키 기반
   - 서로 영향 없이 안전하게 작동

---

**다음 단계**: Phase 1부터 순차적으로 진행
**문서 위치**: `C:\projects\maumtown\docs\ORACLE_PROXY_IMPLEMENTATION_PLAN.md`
