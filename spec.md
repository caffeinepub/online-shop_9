# Online Shop

## Current State
- Internet-магазин на React + Motoko
- Авторизация через Internet Identity (Principal-based)
- Баланс пользователя хранится в localStorage по числовому userId
- Админ-панель защищена паролем (fftr56#^), имеет вкладки: Товары, Заказы, Витрина, Премиум, Кошельки
- Администратор может пополнять кошелёк пользователя по числовому ID и выдавать Премиум
- Поддержка WhatsApp/Telegram в футере (+992173918530)
- Stripe подключён для пополнения баланса картой

## Requested Changes (Diff)

### Add
- Собственная система авторизации: пользователь вводит email (придуманный), пароль и номер WhatsApp или Telegram при регистрации
- Страница `/login` с формой входа (email + пароль) + ссылка "Регистрация"
- Страница `/register` с формой: email, пароль, подтверждение пароля, номер WhatsApp или Telegram (необязательно)
- AuthContext для хранения текущего пользователя (localStorage)
- useAuth hook для доступа к текущему пользователю
- Список всех зарегистрированных пользователей в AdminUsersPage (`/admin/users`)
- Вкладка "Пользователи" в сайдбаре админ-панели
- Функция блокировки аккаунта пользователя (заблокированный видит сообщение и не может войти/использовать магазин)
- Функция списания с кошелька пользователя (поле сумма + ID пользователя)

### Modify
- Header: убрать кнопку Internet Identity, добавить кнопки "Войти" / "Зарегистрироваться" для незалогиненных, и имя/выход для залогиненных
- AdminBalancePage: добавить вкладку/секцию "Списать с кошелька" рядом с "Пополнить"
- App.tsx: добавить маршруты `/login`, `/register`, `/admin/users`

### Remove
- Internet Identity кнопки входа/выхода из Header (заменяются собственной авторизацией)

## Implementation Plan
1. Создать `src/context/AuthContext.tsx` с хранением пользователей в localStorage (email, password hash, contact, userId, isBlocked, isPremium)
2. Создать `src/hooks/useAuth.ts` 
3. Создать `src/pages/LoginPage.tsx` — форма входа с ссылкой на регистрацию
4. Создать `src/pages/RegisterPage.tsx` — форма регистрации
5. Обновить `Header.tsx` — заменить Internet Identity на собственную авторизацию
6. Создать `src/pages/admin/AdminUsersPage.tsx` — список пользователей с блокировкой и списанием
7. Обновить `AdminBalancePage.tsx` — добавить секцию "Списать с кошелька"
8. Обновить `AdminLayout.tsx` — добавить ссылку Пользователи в сайдбар
9. Обновить `App.tsx` — добавить маршруты /login, /register, /admin/users
10. Обернуть App в AuthProvider
