import Head from "next/head";
import { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.css";

export default function Home() {
  const [password, setPassword] = useState<string>();
  const [useDictionary, setUseDictionary] = useState<boolean>(true);
  const [useBackend, setUseBackend] = useState<boolean>(true);

  const getPasswordDictionary = async (): Promise<string> => {
    const url =
      "https://raw.githubusercontent.com/danielmiessler/SecLists/master/Passwords/Common-Credentials/10-million-password-list-top-1000000.txt";
    const response = await fetch(url);
    return response.text();
  };

  const getDictionary = async (): Promise<string[]> => {
    const response = await getPasswordDictionary();
    return response.split("\n");
  };

  const bruteForce = (password: string): boolean => {
    const charset =
      " !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[]^_`abcdefghijklmnopqrstuvwxyz{|}~";

    const toRadix = (N: number) => {
      let HexN = "",
        Q = Math.floor(Math.abs(N)),
        R,
        strv = charset,
        radix = strv.length;
      while (true) {
        R = Q % radix;
        HexN = strv.charAt(R) + HexN;
        Q = (Q - R) / radix;
        if (Q == 0) break;
      }
      return N < 0 ? "-" + HexN : HexN;
    };
    let cracked = false,
      index = 0;
    while (!cracked) {
      if (toRadix(index) == password) cracked = true;
      else index++;
    }

    return true;
  };

  const findPasswordOnDictonary = (
    dictionary: string[],
    password: string
  ): boolean => {
    return !!dictionary.find((word) => word === password);
  };

  const bruteForceFromBackend = async () => {
    const guessed = await fetch("/api/crack-password", {
      method: "POST",
      body: JSON.stringify({
        password,
        useDictionary,
        useBackend,
      }),
    });
    const response = await guessed.json();
    return response;
  };

  const bruteForceFromFrontend = async () => {
    const dictionary = await getDictionary();
    const start = Number(new Date()) * 1;
    let foundInDictionary = false;
    let guessed = false;

    if (useDictionary) {
      foundInDictionary = findPasswordOnDictonary(dictionary, password!);
    }
    if (!foundInDictionary) {
      guessed = bruteForce(password!);
    }
    const end = Number(new Date()) * 1;
    return {
      timeToCrack: `Sua senha foi quebrada em: ${end - start} milisegundos`,
    };
  };

  const startBruteForce = async (): Promise<void> => {
    const response = useBackend
      ? await bruteForceFromBackend()
      : await bruteForceFromFrontend();
    alert(response.timeToCrack ?? response.error);
  };

  return (
    <>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="container pt-5">
        <h1>Quebrador de senhas</h1>
        <form className="form-group">
          <div className="mb-3">
            <label htmlFor="password" className="form-label">
              Digite a Senha
            </label>
            <input
              name="password"
              id="password"
              type="text"
              className="form-control"
              onChange={(event) => setPassword(event.target.value)}
            ></input>
          </div>
          <div className="form-check mb-3">
            <input
              className="form-check-input"
              name="useDictionary"
              type="checkbox"
              checked={useDictionary}
              onChange={() => setUseDictionary(!useDictionary)}
            />
            <label className="form-check-label" htmlFor="useDictionary">
              Usar Dicionário
            </label>
          </div>
          <div className="form-check mb-3">
            <input
              className="form-check-input"
              name="useBackend"
              type="checkbox"
              checked={useBackend}
              onChange={() => setUseBackend(!useBackend)}
            />
            <label className="form-check-label" htmlFor="useBackend">
              Usar Backend
            </label>
          </div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={startBruteForce}
          >
            Iniciar Força Bruta
          </button>
        </form>
      </main>
    </>
  );
}
