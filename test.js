import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
    vus: 50,         // 50 виртуальных пользователей
    duration: '30s',  // Длительность теста 30 секунд
  };

export default function () {
  let baseUrl = 'https://test-api.k6.io';

  // 1️⃣ Регистрация пользователя
  let username = `user_${Math.random().toString(36).substr(2, 5)}`;
  let password = 'SuperSecure123!';
  let payload = JSON.stringify({ username, password });

  let params = { headers: { 'Content-Type': 'application/json' } };

  let registerRes = http.post(`${baseUrl}/user/register/`, payload, params);
  console.log('🔹 Регистрация:', registerRes.status, registerRes.body);

  check(registerRes, { 'Статус регистрации 201': (r) => r.status === 201 });

  if (registerRes.status !== 201) return;

  sleep(1);

  // 2️⃣ Логин и получение токена
  let loginPayload = JSON.stringify({ username, password });
  let loginRes = http.post(`${baseUrl}/auth/token/login/`, loginPayload, params);

  console.log('🔹 Логин:', loginRes.status, loginRes.body);

  check(loginRes, { 'Статус логина 200': (r) => r.status === 200 });

  if (loginRes.status !== 200) return;

  let authToken = JSON.parse(loginRes.body).access;
  let authHeaders = {
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
  };

  sleep(1);

  // 3️⃣ Создание "крокодила"
  let crocPayload = JSON.stringify({
    name: "MyCrocodile",
    sex: "M",
    date_of_birth: "2015-06-22",
  });

  let crocRes = http.post(`${baseUrl}/my/crocodiles/`, crocPayload, authHeaders);
  console.log('🔹 Создание крокодила:', crocRes.status, crocRes.body);

  check(crocRes, { 'Статус создания 201': (r) => r.status === 201 });

  if (crocRes.status !== 201) return;

  let crocId = JSON.parse(crocRes.body).id;

  sleep(1);

  // 4️⃣ Удаление "крокодила"
  let deleteRes = http.del(`${baseUrl}/my/crocodiles/${crocId}/`, null, authHeaders);
  console.log('🔹 Удаление крокодила:', deleteRes.status, deleteRes.body);

  check(deleteRes, { 'Статус удаления 204': (r) => r.status === 204 });

  if (deleteRes.status !== 204) {
    console.error(`❌ Ошибка удаления крокодила: ${deleteRes.body}`);
  }

  sleep(1);
}