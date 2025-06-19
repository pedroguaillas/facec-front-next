// src/types/node-forge.d.ts

declare module 'node-forge' {
  namespace util {
    function decode64(encoded: string): string;
    function createBuffer(input: string | Buffer): ByteBuffer; // Added Buffer type

    interface ByteBuffer {
      toString(encoding?: string): string;
      getBytes(): string;
      toHex(): string; // Commonly used for digest
      // Add other methods you use, e.g., 'length()'
    }
  }

  namespace asn1 {
    // fromDer typically returns an ASN.1 object.
    // For simplicity, we can define a basic structure or look up more specific types if needed.
    // A more precise type might be `Asn1Object` if node-forge exports one.
    // For now, let's represent a generic ASN.1 object for this context.
    // If it's still 'any', the error is coming from how it's used.
    interface Asn1Object {
      tagClass: number;
      type: number;
      constructed: boolean;
      header: string;
      value: string | Asn1Object[]; // Can be a string or an array of child ASN.1 objects
      // ... other properties you might access
    }
    function fromDer(der: util.ByteBuffer | string): Asn1Object; // Changed 'any' to Asn1Object
  }

  namespace pki {
    const oids: {
      certBag: string;
      pkcs8ShroudedKeyBag: string; // Commonly used for keys
      // Add other OIDs you use
    };

    interface Validity {
      notBefore: Date;
      notAfter: Date;
    }

    interface Certificate {
      validity: Validity;
      // You might also access other properties like:
      serialNumber: string;
      subject: Attribute[];
      issuer: Attribute[];
      extensions: Extension[];
      publicKey: PublicKey;
      // ... more properties based on your usage
    }

    interface Attribute {
      type: string;
      value: string | string[]; // Can be an array if multi-valued
    }

    interface Extension {
      name: string;
      value: string;
      critical: boolean;
      // ... other properties depending on extension type
    }

    // interface PublicKey {
    //     n: any; // BigInteger, but 'any' if you don't use it directly
    //     e: any; // BigInteger
    //     // ...
    // }
  }

  namespace pkcs12 {
    interface Bag {
      type: string;
      cert?: pki.Certificate;
      // For keys, it depends on whether it's an RSAPrivateKey, DSAPrivateKey, etc.
      // Often, `node-forge` provides an interface like `PrivateKey`.
      // If you primarily use it for signing, you might not need to define `key` extensively.
      key?: pki.PrivateKey | pki.PublicKey; // Assuming PrivateKey exists in pki
      // For shrouded keys, it might be a different structure
      // For now, let's refine `key` to something more specific than `any`.
      // If you're only interested in certs, `any` might be tolerable here initially.
      // A more robust type might be `Pkcs12PbeParamsBag` or `Pkcs12CertBag` etc.
      // based on the bag type.
      attributes?: { [key: string]: string[] | string }; // Attributes associated with the bag
    }

    interface Pkcs12 {
      getBags(options: { bagType: string }): Bag[] | undefined;
      // This method returns an object with certBags, keyBags, etc.
      // The `getBags` method on Pkcs12 often returns a structure with named properties
      // like `pkcs12.certBags` and `pkcs12.keyBags`, not just a simple array from `getBags()`.
      // Let's refine based on how you used it (`p12.getBags({ bagType: ... })`).
      // If `getBags` returns an array, then the `Bag[] | undefined` is correct.
      // If it returns an object, we need to adjust.
      // Based on the 'certBags[0].cert' usage, `Bag[]` is likely correct for what `getBags` returns.

      // If you use these properties, add them:
      certBags: Bag[];
      keyBags: Bag[];
      // ... other collections of bags
    }

    // pkcs12FromAsn1 returns a Pkcs12 object.
    // The `asn1` parameter is the result from `forge.asn1.fromDer()`, so it's an `asn1.Asn1Object`.
    function pkcs12FromAsn1(asn1: asn1.Asn1Object, password?: string): Pkcs12; // Changed 'any' to asn1.Asn1Object
  }

  // --- Top-level forge object ---
  // Ensure all modules you define are included here and typed correctly.
  const forge: {
    util: typeof util;
    asn1: typeof asn1;
    pki: typeof pki;
    pkcs12: typeof pkcs12;
    //md: any; // If you use forge.md.sha256, you'd need to define md namespace
    //cipher: any; // If you use cipher
    // Add other top-level modules like pki, cipher, etc.
  };

  export = forge;
}