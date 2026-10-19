const createUserService = ({ userRepository }) => {
  const getUsers = async () => {
    return userRepository.getUsers();
  };

  return {
    getUsers
  };
};

module.exports = createUserService;
