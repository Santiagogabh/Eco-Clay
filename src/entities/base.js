const storeKey = (name) => `ecoclay_${name}`;

function read(name) {
  try {
    const raw = localStorage.getItem(storeKey(name));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function write(name, data) {
  localStorage.setItem(storeKey(name), JSON.stringify(data));
}

function sortBy(arr, order) {
  if (!order) return arr;
  const desc = order.startsWith('-');
  const key = desc ? order.slice(1) : order;
  return [...arr].sort((a, b) => {
    if (a[key] === b[key]) return 0;
    return (a[key] > b[key] ? 1 : -1) * (desc ? -1 : 1);
  });
}

export function createEntity(name) {
  return {
    async list(order) {
      const data = read(name);
      return sortBy(data, order);
    },
    async filter(where = {}, order) {
      const data = read(name).filter(item =>
        Object.entries(where).every(([k, v]) => item[k] === v)
      );
      return sortBy(data, order);
    },
    async create(doc) {
      const data = read(name);
      const id = crypto.randomUUID();
      const created_date = new Date().toISOString();
      const item = { id, created_date, ...doc };
      data.push(item);
      write(name, data);
      return item;
    },
    async update(id, patch) {
      const data = read(name);
      const idx = data.findIndex(d => d.id === id);
      if (idx >= 0) {
        data[idx] = { ...data[idx], ...patch };
        write(name, data);
        return data[idx];
      }
      throw new Error(`${name} with id ${id} not found`);
    }
  };
}
