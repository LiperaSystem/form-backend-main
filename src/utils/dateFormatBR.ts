export default function DateBR() {
  const options = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Sao_Paulo',
  };

  const data = new Date().toLocaleString('pt-BR', options);

  console.log(data)
  return data;
}
