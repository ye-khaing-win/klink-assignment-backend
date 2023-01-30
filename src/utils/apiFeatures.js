class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
    this.pagination = {};
  }

  filter() {
    const queryClone = { ...this.queryString };

    // 1.2) Exclude SORT, PAGE, LIMIT and SELECT fields
    const excludedFields = ['sort', 'page', 'limit', 'select'];

    excludedFields.forEach((field) => delete queryClone[field]);

    // 1.3) Replace operators with MONGO operators
    let queryStr = JSON.stringify(queryClone);

    queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (match) => `$${match}`);
    const queryObj = JSON.parse(queryStr);

    // 1.4) Parse query list (with comma) to Array
    const queryClean = {};

    Object.keys(queryObj).forEach((key) => {
      if (typeof queryObj[key] === 'string' && queryObj[key].includes(',')) {
        const values = queryObj[key].split(',').map((val) => val.trim());

        queryClean[key] = values;
      } else {
        queryClean[key] = queryObj[key];
      }
    });

    this.query = this.query.find(queryClean);

    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');

      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }

    return this;
  }

  select() {
    if (this.queryString.select) {
      const fields = this.queryString.select.split(',').join(' ');

      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }

    return this;
  }

  populate() {
    if (this.queryString.populate) {
      const popOptions = this.queryString.populate.split(',').join(' ');

      this.query = this.query.populate(popOptions);
      console.log(popOptions);
    }

    return this;
  }

  paginate(count) {
    const page = +this.queryString.page || 1;
    const limit = +this.queryString.limit;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    this.query = this.query.skip(startIndex).limit(limit);

    if (startIndex > 0) {
      this.pagination.prev = {
        page: page - 1,
        limit,
      };
    }

    if (endIndex < count) {
      this.pagination.next = {
        page: page + 1,
        limit,
      };
    }

    return this;
  }
}

export default APIFeatures;
