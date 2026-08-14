export default function NoProductsFound() {
  return (
    <>
      <div className="flex outline-2 outline-dashed w-full h-100 items-center text-center justify-center rounded-md">
        <div>
          <p>A arara está vazia</p>
          <p className="mt-2 mb-2 max-w-lg">
            Viu uma peça que amou? É só clicar em Adicionar Produto
          </p>
          {/* <Button
            size="lg"
            className="bg-red-700 hover:bg-red-800"
            onClick={() => focusInput()}
          >
            Colar o primeiro link
          </Button> */}
        </div>
      </div>
    </>
  );
}
