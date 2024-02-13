export function formatDateWithWords(dateString) {
    const date = new Date(dateString);
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
  
    const day = date.getDate();
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
  
    return `${month} ${day}, ${year}`;
  }

export function checkPassword(password) {
  const regex = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*\W)(?!.* ).{8,16}$/;
  return regex.test(password);
}

export function checkUsername(val) {
  const username = val.toLowerCase().trim();
  const regex = /^[a-zA-Z0-9]+(?:[_.][a-zA-Z0-9]+)*$/;

  return regex.test(username);
}

export function checkDisplayName(val) {
  const displayname = val;
  const regex = /\s\s/;

  return !regex.test(displayname);
}
