export default async (request) => {
    const url = new URL(request.url);
    const targetUrl = url.searchParams.get("url");
  
    // Validação de segurança para garantir que só requisições para o Deezer passem por aqui
    if (!targetUrl || !targetUrl.startsWith("https://api.deezer.com/")) {
      return new Response(JSON.stringify({ error: "URL inválida ou ausente." }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
  
    try {
      // O servidor do Netlify busca os dados diretamente da API do Deezer
      const response = await fetch(targetUrl);
      
      if (!response.ok) {
        return new Response(JSON.stringify({ error: `Deezer retornou status ${response.status}` }), {
          status: response.status,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
        });
      }
  
      const data = await response.json();
  
      // Retorna os dados para o seu front-end com os cabeçalhos de CORS liberados
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET"
        }
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), { 
        status: 500,
        headers: { "Access-Control-Allow-Origin": "*" }
      });
    }
  };
  
  // Define a rota interna que seu app vai chamar (ex: https://audition-pj.netlify.app/api/deezer-proxy)
  export const config = { path: "/api/deezer-proxy" };