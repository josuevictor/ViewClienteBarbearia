export const fetchBarbeiros = async () => {
  try {
    const response = await fetch('https://backendbarbearia-2.onrender.com/api/barbeiro');
    const responseData = await response.json();
    if (responseData.success) {
      return responseData.object.original;
    } else {
      console.error('Erro ao buscar dados:', responseData.msg);
      return [];
    }
  } catch (error) {
    console.error('Erro ao buscar dados:', error);
    return [];
  }
};