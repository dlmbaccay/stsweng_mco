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
  const regex = /^[a-zA-Z0-9]+(?:[_.][a-zA-Z0-9]+)*$/;
  return regex.test(val) && val.length >= 3 && val.length <= 15;
}

export function checkDisplayName(val) {
  if (val) {
    const regex = /^[^\s]+(\s+[^\s]+)*$/;
    return regex.test(val) && val.length >= 1 && val.length <= 30;
  }
}

export function checkLocation(val) {
  if (val) {
    const regex = /^[^\s]+(\s+[^\s]+)*$/;
    return regex.test(val) && val.length >= 2 && val.length <= 30;
  }
}