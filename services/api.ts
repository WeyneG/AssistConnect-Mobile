const API_URL = "http://192.168.0.7:8080/api";

export async function login(email: string, password: string) {
  const response = await fetch(`${API_URL}/auth/login`, {
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

export async function getIdosos(token: string) {
  const response = await fetch(`${API_URL}/idosos`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
  });

  if (!response.ok) {
    throw new Error("Erro ao buscar idosos");
  }

  return await response.json();
}
