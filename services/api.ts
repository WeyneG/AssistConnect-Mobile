const API_URL = "http://10.80.34.196:8080";

export async function login(email: string, password: string) {
  const response = await fetch(`${http://10.0.2.2:8080}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  const data = await response.json();
  return data;
}