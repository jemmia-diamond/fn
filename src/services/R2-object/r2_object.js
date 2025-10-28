export class R2ObjectStorage {

  static getObjectFromR2 = async (env, key) => {
    const object = await env.R2_STORAGE.get(key);

    if (!object) {
      return null;
    }

    const arrayBuffer = await object.arrayBuffer();
    return arrayBuffer;
  };
}
