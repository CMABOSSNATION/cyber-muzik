export const handleLike = async (trackId) => {
  const token = typeof window !== "undefined"
    ? localStorage.getItem('token')
    : null;
  if (!token) { alert("You must be logged in."); return; }
  await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/like`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ trackId })
  });
  alert("Added to Liked Songs!");
};
