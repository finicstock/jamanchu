# 자만추 Mobile Deployment

## 현재 배포 형태

자만추는 Vite 웹앱과 Express API 서버로 구성되어 있다. 모바일 배포는 두 단계로 나눈다.

1. PWA: HTTPS URL을 홈 화면에 추가해 앱처럼 실행한다.
2. Android APK: GitHub Actions가 Capacitor Android 앱을 빌드해 설치 파일을 만든다.

사용자가 "다운로드해서 설치하는 앱"을 원한다면 Android APK 방식을 사용한다.

## Android APK 만들기

1. GitHub 저장소로 이동한다.
2. 상단의 `Actions` 탭을 누른다.
3. 왼쪽 목록에서 `Build Android APK`를 선택한다.
4. `Run workflow` 버튼을 누른다.
5. 브랜치는 `codex/mvp-product-alignment`를 선택한다.
6. 실행이 끝날 때까지 기다린다.
7. 완료된 실행 화면 아래의 `Artifacts`에서 `jamanchu-android-apk`를 다운로드한다.
8. 압축을 풀면 `jamanchu-debug.apk`가 나온다.
9. 이 APK 파일을 안드로이드 휴대폰으로 옮겨 설치한다.

처음 설치할 때 휴대폰에서 "알 수 없는 앱 설치 허용"을 켜야 할 수 있다. 이 APK는 테스트용 debug 빌드다. 플레이스토어 배포용으로는 release 서명과 AAB 빌드가 추가로 필요하다.

## APK가 실제 서버를 보게 만들기

기본 APK는 현재 웹 빌드를 앱 안에 넣는다. 로그인, 결제, 서버 저장 기능까지 실제로 쓰려면 HTTPS로 배포된 자만추 서버 주소를 GitHub Actions 변수로 넣는 것이 좋다.

1. GitHub 저장소의 `Settings`로 이동한다.
2. `Secrets and variables` > `Actions`로 이동한다.
3. `Variables` 탭에서 `New repository variable`을 누른다.
4. 이름은 `CAPACITOR_SERVER_URL`로 입력한다.
5. 값은 배포된 HTTPS 주소를 입력한다. 예: `https://jamanchu.example.com`
6. 다시 `Build Android APK` 워크플로를 실행한다.

이 변수가 있으면 APK는 앱 내부 정적 파일 대신 배포된 서버 URL을 WebView로 연다.

## PWA 배포 체크리스트

1. 프로덕션 빌드

   ```bash
   corepack pnpm run build
   ```

2. Node 서버 실행

   ```bash
   NODE_ENV=production PORT=3000 node dist/index.js
   ```

3. HTTPS 도메인에 연결

   PWA 설치와 서비스 워커는 HTTPS에서 동작한다. 로컬 테스트의 `localhost`는 예외지만, 실제 모바일 설치 테스트는 HTTPS 도메인에서 확인해야 한다.

4. 모바일 설치 확인
   - Android Chrome: URL 접속 후 브라우저 메뉴에서 앱 설치 또는 홈 화면에 추가
   - iPhone Safari: 공유 버튼에서 홈 화면에 추가

## 스토어 배포로 전환할 때

스토어 배포에는 개발자 계정과 서명 정보가 필요하다.

- Android: Google Play Console 계정, 패키지명, 앱 서명 키, 개인정보처리방침 URL
- iOS: Apple Developer 계정, Bundle ID, 인증서/프로비저닝 프로파일, App Privacy 응답

실제 스토어 출시가 필요하면 현재 PWA URL을 기준으로 Capacitor 또는 Android TWA 래퍼를 붙이는 것이 가장 빠르다. 이때도 앱 이름, 아이콘, 스플래시, 딥링크, 개인정보처리방침은 지금 추가한 PWA 메타데이터를 기준으로 재사용할 수 있다.
