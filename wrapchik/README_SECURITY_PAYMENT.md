# Wrapchik - security, OTP and payment upgrade

This version keeps the existing MongoDB/Express + Expo Router architecture and adds:

- Phone OTP login with short-lived, hashed OTP challenges.
- Optional Twilio Verify SMS provider for production.
- Stronger password rules and bcrypt cost 12.
- No public admin-role selection during signup.
- JWT validation with HS256 and a required 32+ character secret.
- Mobile JWT/user data stored in Expo SecureStore instead of AsyncStorage.
- Helmet security headers and authentication/OTP rate limiting.
- Notification permission + Expo push-token registration.
- Razorpay order creation + real server-side signature verification.
- Raw-body Razorpay webhook verification.
- Checkout idempotency key to reduce duplicate orders from double taps.
- Takeaway / Delivery / Dine-in selector redesigned as a compact three-option UI.

## 1. Backend setup

```bash
cd backend
npm install
copy .env.example .env
```

On macOS/Linux use `cp .env.example .env` instead of `copy`.

Set at minimum:

- `MONGO_URI`
- `JWT_SECRET` (random, 32+ characters)
- `OTP_PEPPER` (another random secret)
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `RAZORPAY_WEBHOOK_SECRET`

For real SMS OTP, configure Twilio Verify:

- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_VERIFY_SERVICE_SID`

If Twilio is not configured and `NODE_ENV=development`, the backend prints a development OTP in the terminal and returns it only to the development client. This fallback is intentionally disabled in production.

Start:

```bash
npm run dev
```

## 2. Frontend setup

```bash
cd frontend
npm install
```

Set `EXPO_PUBLIC_API_URL` in `frontend/.env` if the backend is not reachable at the automatic LAN URL.

## 3. Razorpay native checkout

The app now uses `react-native-razorpay` rather than a fake payment response.
Because that package contains native code, Expo Go is not enough for the real checkout. Generate a native build:

```bash
npx expo prebuild
npx expo run:android
```

For iOS:

```bash
npx expo prebuild
eas build --platform ios --profile preview
```

Do not put `RAZORPAY_KEY_SECRET` in the frontend. Only the public `RAZORPAY_KEY_ID` is sent to the app.

## 4. Razorpay Dashboard tasks you must do yourself

1. Create/verify the Razorpay business account.
2. Generate Test Mode API keys first.
3. Configure the webhook URL:
   `https://YOUR_BACKEND_DOMAIN/api/payment/webhook`
4. Configure the webhook secret to match `RAZORPAY_WEBHOOK_SECRET`.
5. Test payment capture and webhook delivery.
6. Before launch, switch to Live Mode keys and complete Razorpay's business/KYC/onboarding requirements.

## 5. SMS provider tasks you must do yourself

Twilio Verify requires an account, a Verify Service, and appropriate SMS configuration. Add those credentials only to the backend `.env`.

## 6. Important production checklist

- Use HTTPS for the backend.
- Replace every demo/placeholder secret.
- Keep `.env` out of Git.
- Use a managed MongoDB instance with authentication and network restrictions.
- For multiple backend instances, replace the in-memory rate limiter with Redis-backed rate limiting.
- Configure CORS to the actual app/web origins instead of `*`.
- Add monitoring/error tracking and database backups.
- Test failed, cancelled, duplicate and delayed payment webhook cases before accepting real money.
