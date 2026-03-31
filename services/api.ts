const API_URL = "http://192.168.0.7:8080/api";

export async function login(email: string, password: string) {
  // Mock temporário para testes — remover quando o backend estiver acessível
  await new Promise(resolve => setTimeout(resolve, 800));
  if (email && password) {
    return { token: 'mock-token-123' };
  }
  return { token: null };

  // Chamada real (descomentar quando o backend estiver disponível):
  // const response = await fetch(`${API_URL}/auth/login`, {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify({ email, password }),
  // });
  // const data = await response.json();
  // return data;
}

