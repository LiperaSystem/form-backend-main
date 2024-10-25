function capitalizeEachWord(name) {
  return name
    .split(' ')
    .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default capitalizeEachWord;