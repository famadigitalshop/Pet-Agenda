// O MeuPet+ ainda não tem uma versão escura aprovada pela marca,
// então o app fica sempre no tema claro/creme, independente do
// modo do sistema (evita mostrar cores fora da identidade visual).
export const useColorScheme = () => 'light' as const;
