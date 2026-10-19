const createUserRepository = ({ baseUrl }) => {
  const getUsers = async () => {
    const resp = await fetch(`${baseUrl}/getUsers`);
    return resp.json();
  };

  const getUserById = async (id) => {
    const resp = await fetch(`${baseUrl}/getUserById/${id}`);
    return resp.json();
  };

  return {
    getUsers,
    getUserById
  }
};

module.exports = createUserRepository;
