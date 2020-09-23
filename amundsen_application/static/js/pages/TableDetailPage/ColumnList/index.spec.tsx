// Copyright Contributors to the Amundsen project.
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { mocked } from 'ts-jest/utils';

import { notificationsEnabled } from 'config/config-utils';

import globalState from 'fixtures/globalState';
import ColumnList, { ColumnListProps } from '.';
import ColumnType from './ColumnType';
import { EMPTY_MESSAGE } from './constants';

import TestDataBuilder from './testDataBuilder';

jest.mock('config/config-utils');

const mockedNotificationsEnabled = mocked(notificationsEnabled, true);
const dataBuilder = new TestDataBuilder();
const middlewares = [];
const mockStore = configureStore(middlewares);

const setup = (propOverrides?: Partial<ColumnListProps>) => {
  const props = {
    editText: 'Click to edit description in the data source site',
    editUrl: 'https://test.datasource.site/table',
    database: 'testDatabase',
    columns: [],
    openRequestDescriptionDialog: jest.fn(),
    ...propOverrides,
  };
  // Update state
  const testState = globalState;
  testState.tableMetadata.tableData.columns = props.columns;

  const wrapper = mount<ColumnListProps>(
    <Provider store={mockStore(testState)}>
      <ColumnList {...props} />
    </Provider>
  );

  return { props, wrapper };
};

describe('ColumnList', () => {
  mockedNotificationsEnabled.mockReturnValue(true);

  describe('render', () => {
    it('renders without issues', () => {
      expect(() => {
        setup();
      }).not.toThrow();
    });

    describe('when empty columns are passed', () => {
      const { columns } = dataBuilder.withEmptyColumns().build();

      it('should render the custom empty messagee', () => {
        const { wrapper } = setup({ columns });
        const expected = EMPTY_MESSAGE;

        const actual = wrapper
          .find('.table-detail-table .ams-empty-message-cell')
          .text();
        expect(actual).toEqual(expected);
      });
    });

    describe('when simple type columns are passed', () => {
      const { columns } = dataBuilder.build();

      it('should render the rows', () => {
        const { wrapper } = setup({ columns });
        const expected = columns.length;
        const actual = wrapper.find('.table-detail-table .ams-table-row')
          .length;

        expect(actual).toEqual(expected);
      });

      it('should render the usage column', () => {
        const { wrapper } = setup({ columns });
        const expected = columns.length;
        const actual = wrapper.find('.table-detail-table .usage-value').length;

        expect(actual).toEqual(expected);
      });

      it('should render the actions column', () => {
        const { wrapper } = setup({ columns });
        const expected = columns.length;
        const actual = wrapper.find('.table-detail-table .actions').length;

        expect(actual).toEqual(expected);
      });
    });

    describe('when complex type columns are passed', () => {
      const { columns } = dataBuilder.withAllComplexColumns().build();

      it('should render the rows', () => {
        const { wrapper } = setup({ columns });
        const expected = columns.length;
        const actual = wrapper.find('.table-detail-table .ams-table-row')
          .length;

        expect(actual).toEqual(expected);
      });

      it('should render ColumnType components', () => {
        const { wrapper } = setup({ columns });
        const expected = columns.length;
        const actual = wrapper.find(ColumnType).length;

        expect(actual).toEqual(expected);
      });
    });

    describe('when columns with no usage data are passed', () => {
      const { columns } = dataBuilder.withComplexColumnsNoStats().build();

      it('should render the rows', () => {
        const { wrapper } = setup({ columns });
        const expected = columns.length;
        const actual = wrapper.find('.table-detail-table .ams-table-row')
          .length;

        expect(actual).toEqual(expected);
      });

      it('should not render the usage column', () => {
        const { wrapper } = setup({ columns });
        const expected = 0;
        const actual = wrapper.find('.table-detail-table .usage-value').length;

        expect(actual).toEqual(expected);
      });
    });

    describe('when columns with one usage data entry are passed', () => {
      const { columns } = dataBuilder.withComplexColumnsOneStat().build();

      it('should render the usage column', () => {
        const { wrapper } = setup({ columns });
        const expected = columns.length;
        const actual = wrapper.find('.table-detail-table .usage-value').length;

        expect(actual).toEqual(expected);
      });
    });

    describe('when notifications are not enabled', () => {
      const { columns } = dataBuilder.build();

      it('should not render the actions column', () => {
        mockedNotificationsEnabled.mockReturnValue(false);
        const { wrapper } = setup({ columns });
        const expected = 0;
        const actual = wrapper.find('.table-detail-table .actions').length;

        expect(actual).toEqual(expected);
      });
    });
  });
});