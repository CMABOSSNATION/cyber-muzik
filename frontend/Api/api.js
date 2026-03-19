const handleLike = async (trackId) => {
  const token = localStorage.getItem('token'); // Get the JWT
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
