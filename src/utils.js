export function createPageUrl(name) {
  // Map logical names used in code to actual routes
  const map = new Map([
    ['Map', '/map'],
    ['Events', '/events'],
    ['Donations', '/donations'],
    ['Profile', '/profile'],
    ['CreateEvent', '/create-event'],
  ]);
  if (name && name.startsWith('Donations?')) {
    // Handle Donations?event_id=...
    const query = name.slice('Donations'.length);
    return `/donations${query}`;
  }
  return map.get(name) || '/map';
}
