// Lista de 30 nomes femininos brasileiros
export const FEMALE_NAMES = [
  'Ana',
  'Maria',
  'Juliana',
  'Fernanda',
  'Patricia',
  'Camila',
  'Mariana',
  'Beatriz',
  'Gabriela',
  'Larissa',
  'Amanda',
  'Carolina',
  'Isabela',
  'Leticia',
  'Vanessa',
  'Renata',
  'Priscila',
  'Daniela',
  'Bruna',
  'Rafaela',
  'Tatiana',
  'Cristina',
  'Monica',
  'Adriana',
  'Sandra',
  'Claudia',
  'Andrea',
  'Luciana',
  'Simone',
  'Roberta'
];

// DDDs reais do Brasil (principais)
const REAL_DDDS = [
  '11', // São Paulo
  '21', // Rio de Janeiro
  '31', // Belo Horizonte
  '41', // Curitiba
  '47', // Joinville
  '48', // Florianópolis
  '51', // Porto Alegre
  '61', // Brasília
  '71', // Salvador
  '81', // Recife
  '85', // Fortaleza
  '92', // Manaus
  '98', // São Luís
  '19', // Campinas
  '27', // Vitória
  '32', // Juiz de Fora
  '38', // Montes Claros
  '42', // Ponta Grossa
  '43', // Londrina
  '44', // Maringá
  '45', // Foz do Iguaçu
  '46', // Francisco Beltrão
  '49', // Chapecó
  '54', // Caxias do Sul
  '55', // Santa Maria
  '62', // Goiânia
  '63', // Palmas
  '64', // Rio Verde
  '65', // Cuiabá
  '66'  // Rondonópolis
];

// Gerar número de telefone aleatório no formato +55 (XX) 9XX XXX XXX
const generatePhoneNumber = () => {
  // Escolher DDD aleatório
  const ddd = REAL_DDDS[Math.floor(Math.random() * REAL_DDDS.length)];
  
  // Gerar número do celular (9XX XXX XXX)
  // Primeiro dígito após o 9 pode ser 0-9
  const firstDigit = Math.floor(Math.random() * 10);
  // Segundo dígito após o 9 pode ser 0-9
  const secondDigit = Math.floor(Math.random() * 10);
  // Primeiros 3 dígitos após 9XX
  const firstThree = Math.floor(100 + Math.random() * 900).toString();
  // Últimos 3 dígitos
  const lastThree = Math.floor(100 + Math.random() * 900).toString();
  
  // Formatar: +55 (XX) 9XX XXX XXX
  return `+55 (${ddd}) 9${firstDigit}${secondDigit} ${firstThree} ${lastThree}`;
};

// Obter nome e telefone aleatórios
export const getRandomClientData = () => {
  const name = FEMALE_NAMES[Math.floor(Math.random() * FEMALE_NAMES.length)];
  const phone = generatePhoneNumber();
  
  return { name, phone };
};

