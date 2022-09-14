function updateHelper(
  username: string,
  data: any,
  tableName: string,
  columnName: string
) {
  let query = [`UPDATE ${tableName}`, 'SET'];

  let set: string[] = [];
  Object.keys(data).forEach(function (key, i) {
    set.push(key + ' = $' + (i + 1));
  });

  query.push(set.join(', '));

  query.push(`WHERE ${columnName} = '${username}' `);

  return query.join(' ');
}

export { updateHelper };
