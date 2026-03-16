const handleLike = async (trackId) => {
  const token = localStorage.getItem('token'); // Get the JWT
  await fetch(`http://localhost:5000/api/users/like`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ trackId })
  });
  alert("Added to Liked Songs!");
};
