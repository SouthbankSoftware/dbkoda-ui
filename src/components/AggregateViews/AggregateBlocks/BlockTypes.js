/*
 * dbKoda - a modern, open source code editor, for MongoDB.
 * Copyright (C) 2017-2018 Southbank Software
 *
 * This file is part of dbKoda.
 *
 * dbKoda is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * dbKoda is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with dbKoda.  If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * @Author: Michael Harrison
 * @Date:   2017-07-21 09:47:09
 * @Email:  mike@southbanksoftware.com
 * @Last modified by:   mike
 * @Last modified time: 2017-07-21 09:47:19
 */

export const BlockTypes = {
  START: {
    type: 'Start',
    description: 'Use this block to configure your pipeline before it begins.',
    fields: {
      Expression: '',
    },
  },
  MATCH: {
    type: 'Match',
    groups: ['common', 'queryAndAggregate'],
    description: 'Reduce your pipeline results using a match on a field.',
    columns: 2,
    fields: {
      Expression: '',
    },
  },
  GROUP: {
    type: 'Group',
    groups: ['common', 'groupAndJoin'],
    secondGroup: 'groupAndJoin',
    description: 'Group your results by a certain predicate',
    fields: {
      ID: '',
    },
  },
  SORT: {
    type: 'Sort',
    groups: ['common', 'groupAndJoin'],
    secondGroup: 'queryAndAggregate',
    description: 'Sort the results from your pipeline',
    fields: {
      Expression: '',
    },
  },
  PROJECT: {
    type: 'Project',
    groups: ['common', 'queryAndAggregate'],
    secondGroup: 'queryAndAggregate',
    description: 'Select and/or rename columns',
    fields: {
      Expression: '',
    },
  },
  UNWIND: {
    type: 'Unwind',
    groups: ['common', 'groupAndJoin'],
    secondGroup: 'groupAndJoin',
    description: 'Unwind an array of data',
    fields: {
      Expression: '',
    },
  },
  LIMIT: {
    type: 'Limit',
    groups: ['common', 'queryAndAggregate'],
    secondGroup: 'queryAndAggregate',
    description: 'Limit the results to a specific number of documents',
    fields: {
      Expression: '',
    },
  },
  SKIP: {
    type: 'Skip',
    groups: ['queryAndAggregate'],
    description: 'Skip ahead in the results',
    fields: {
      Expression: '',
    },
  },
  SAMPLE: {
    type: 'Sample',
    groups: ['queryAndAggregate'],
    description: 'Obtain a random sample of databases',
    fields: {
      Expression: '',
    },
  },
  LOOKUP: {
    type: 'Lookup',
    groups: ['groupAndJoin'],
    description: 'Join one collection to another',
    fields: {
      Expression: '',
    },
  },
  GRAPHLOOKUP: {
    type: 'GraphLookup',
    groups: ['common', 'groupAndJoin'],
    description: 'Perform a recursive graph join',
    fields: {
      Expression: '',
    },
  },
  COUNT: {
    type: 'Count',
    groups: ['common', 'groupAndJoin'],
    description: 'Count the number of documents',
    fields: {
      Expression: '',
    },
  },
  OUT: {
    type: 'Out',
    groups: ['other'],
    description: 'Send the output to a new collection',
    fields: {
      Expression: '',
    },
  },
  ADDFIELDS: {
    type: 'AddFields',
    groups: ['transform'],
    description: 'Add derived fields to your results',
    fields: {
      Expression: '',
    },
  },
  SORTBYCOUNT: {
    type: 'SortByCount',
    groups: ['queryAndAggregate'],
    description: 'Perform a group,count and sort in a single step',
    fields: {
      Expression: '',
    },
  },
  BUCKET: {
    type: 'Bucket',
    groups: ['transform'],
    description: 'Aggregate data into range groups',
    fields: {
      Expression: '',
    },
  },
  BUCKETAUTO: {
    type: 'BucketAuto',
    groups: ['transform'],
    description: 'Aggregate data into equally size groups',
    fields: {
      Expression: '',
    },
  },
  REPLACEROOT: {
    type: 'ReplaceRoot',
    groups: ['other'],
    description: 'Promote an embedded document to the top level',
    fields: {
      Expression: '',
    },
  },
  FACET: {
    type: 'Facet',
    groups: ['transform'],
    description: 'Process multiple pipelines in a single stage',
    fields: {
      Expression: '',
    },
  },
  REDACT: {
    type: 'Redact',
    groups: ['transform'],
    description: 'Restrict visibility of items',
    fields: {
      Expression: '',
    },
  },
};
