/** @format */

// interval에 따른 시간 합치기
function mergeDate(date: any, interval: any) {
  const [YYYY, TTTT] = date.split(" ");
  const [hour, minute, second] = TTTT.split(":");

  if (interval === 2400) {
    return `${YYYY} ${hour}:00:00`;
  } else if (interval === 1200) {
    return `${YYYY} ${hour}:${(
      "0" + (Number(minute) - (Number(minute) % 30)).toString()
    ).slice(-2)}:00`;
  } else if (interval === 300) {
    return `${YYYY} ${hour}:${(
      "0" + (Number(minute) - (Number(minute) % 10)).toString()
    ).slice(-2)}:00`;
  } else if (interval === 40) {
    return `${YYYY} ${hour}:${minute}:00`;
  } else if (interval === 20) {
    return `${YYYY} ${hour}:${minute}:${(
      "0" + (Number(second) - (Number(second) % 30)).toString()
    ).slice(-2)}`;
  } else if (interval === 10) {
    return `${YYYY} ${hour}:${minute}:${(
      "0" + (Number(second) - (Number(second) % 10)).toString()
    ).slice(-2)}`;
  } else {
    return date;
  }
}

function currentDate(data: any) {
  const resUtc = new Date(data);
  const year = resUtc.getFullYear();
  const month = ("0" + (resUtc.getMonth() + 1)).slice(-2);
  const date = ("0" + resUtc.getDate()).slice(-2);

  const hours = ("0" + resUtc.getHours()).slice(-2);
  const minutes = ("0" + resUtc.getMinutes()).slice(-2);
  const seconds = ("0" + resUtc.getSeconds()).slice(-2);

  return `${year}/${month}/${date} ${hours}:${minutes}:${seconds}`;
}

function currentDateNoTime(data: any) {
  const resUtc = new Date(data);
  const year = resUtc.getFullYear();
  const month = ("0" + (resUtc.getMonth() + 1)).slice(-2);
  const date = ("0" + resUtc.getDate()).slice(-2);

  return `${year}/${month}/${date}`;
}

function currentTime(data: any) {
  const resUtc = new Date(data);

  const hours = ("0" + resUtc.getHours()).slice(-2);
  const minutes = ("0" + resUtc.getMinutes()).slice(-2);
  const seconds = ("0" + resUtc.getSeconds()).slice(-2);

  return `${hours}:${minutes}`;
}

function currentTimeSecond(data: any) {
  const resUtc = new Date(data);

  const hours = ("0" + resUtc.getHours()).slice(-2);
  const minutes = ("0" + resUtc.getMinutes()).slice(-2);
  const seconds = ("0" + resUtc.getSeconds()).slice(-2);

  return `${hours}:${minutes}:${seconds}`;
}

export {
  mergeDate,
  currentDate,
  currentDateNoTime,
  currentTime,
  currentTimeSecond,
};
