import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const dictionary = await getDictionary();
  const body = JSON.parse(req.body);
  const password = body.password;
  const useDictionary = body.useDictionary;
  const start = Number(new Date()) * 1;
  let foundInDictionary = false;
  let guessed = false;

  if (password.length > 4) {
    res.status(400).json({ error: "Password must have until 4 characters" });
  } else {
    if (useDictionary) {
      foundInDictionary = findPasswordOnDictonary(dictionary, password);
    }
    if (!foundInDictionary) {
      guessed = bruteForce(password);
    }
    const end = Number(new Date()) * 1;
    res.status(200).json({
      timeToCrack: `Sua senha foi quebrada em: ${end - start} milisegundos`,
    });
  }
}

async function getPasswordDictionary(): Promise<string> {
  const url =
    "https://raw.githubusercontent.com/danielmiessler/SecLists/master/Passwords/Common-Credentials/10-million-password-list-top-1000000.txt";
  const response = await fetch(url);
  return response.text();
}

async function getDictionary(): Promise<string[]> {
  const response = await getPasswordDictionary();
  return response.split("\n");
}

function bruteForce(password: string): boolean {
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
}

function findPasswordOnDictonary(dictionary: string[], password: string) {
  return !!dictionary.find((word) => word === password);
}
