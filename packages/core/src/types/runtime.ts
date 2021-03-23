import { PipelineMeta } from './pipeline';
import * as DataCook from '@pipcook/datacook';
export type DefaultType = any;

/**
 * A sample is a labeled data, which could be used to be trained
 * into machine learning models.
 */
export interface Sample<T = DefaultType> {
  label: number;
  data: T;
}

/**
 * Pipcook task types:
 *   All: run all scripts;
 *   Data: run data source and dataflow script;
 *   Model: run model script;
 */
export enum TaskType {
  All,
  Data,
  Model,
  Unknown
}

/**
 * Data source types contain `Table` and `Image`.
 */
export enum DataSourceType { Table, Image }

/**
 * Table-based data structure.
 */
/**
 * The column types
 */
export enum TableColumnType {
  Number,
  String,
  Bool,
  Map,
  Datetime,
  Unknown
}

/**
 * The column description.
 */
export interface TableColumn {
  name: string,
  type: TableColumnType
}

/**
 * The table schema for columns.
 */
export type TableSchema = Array<TableColumn>;

/**
 * The size of data source
 */
export interface DataSourceSize {
  /**
   * The size of dataset for training.
   */
  train: number;
  /**
   * The size of dataset for testing model.
   */
  test: number;
  /**
   * The size of dataset for validating.
   */
  validation?: number;
}

/**
 * The 3-dimension(x,y,z) of an image.
 */
export interface ImageDimension {
  x: number,
  y: number,
  z: number
}

/**
 * image data source metadata
 */
export interface ImageDataSourceMeta {
  type: DataSourceType;
  size: DataSourceSize;
  dimension: ImageDimension;
  labelMap: Record<number, string>;
}

/**
 * table data source metadata
 */
export interface TableDataSourceMeta {
  type: DataSourceType;
  size: DataSourceSize;
  tableSchema: TableSchema;
  dataKeys: Array<string> | null;
  labelMap: Record<number, string>;
}

export type DataSourceMeta = TableDataSourceMeta | ImageDataSourceMeta;
export interface DataAccessor<T = DefaultType> {
  next: () => Promise<Sample<T> | null>;
  nextBatch: (batchSize: number) => Promise<Array<Sample<T>> | null>;
  seek: (pos: number) => Promise<void>;
}

/**
 * data source api
 */
export interface DataSourceApi<T = DefaultType> {
  // fetch data source metadata
  getDataSourceMeta: () => Promise<DataSourceMeta>;
  // test dataset accessor
  test: DataAccessor<T>;
  // train dataset accessor
  train: DataAccessor<T>;
  // valid dataset accessor, optional
  validation?: DataAccessor<T>;
}

/**
 * progress infomation
 */
export interface ProgressInfo {
  // progress percentage, 0 - 100
  progressValue: number;
  // custom data
  extendData: Record<string, any>;
}

/**
 * A Runtime is used to run pipelines on a specific platform. The interface `Runtime<T>`
 * declares APIs which the runtime implementation must or shall achieve.
 */
export interface Runtime<T = DefaultType> {
  // get pipeline metadata
  pipelineMeta: () => Promise<PipelineMeta>;
  // get current task type
  taskType: () => TaskType | undefined;
  // report progress of pipeline
  notifyProgress: (progress: ProgressInfo) => void;
  // save the model file
  saveModel: (localPathOrStream: string | NodeJS.ReadableStream, filename: string) => Promise<void>;
  // read model file
  readModel: () => Promise<string>;
  // datasource
  dataSource: DataSourceApi<T>;
}

export type FrameworkModule = any;
export type DataCookModule = typeof DataCook;
export type DataCookImage = DataCook.Image;
export interface ScriptContext {
  // boa module
  boa: FrameworkModule;
  // DataCook module
  dataCook: DataCookModule;
  // import javascript module
  importJS: (jsModuleName: string) => Promise<FrameworkModule>;
  // import python package
  importPY: (pyModuleName: string) => Promise<FrameworkModule>;
  // volume workspace
  workspace: {
    // dataset directory
    dataDir: string;
    // cache directory
    cacheDir: string;
    // model directory
    modelDir: string;
  }
}

/**
 * type of data source script entry
 */
export type DataSourceEntry<T> = (options: Record<string, any>, context: ScriptContext) => Promise<DataSourceApi<T>>;

/**
 * type of data flow script entry
 */
export type DataFlowEntry<IN, OUT = IN> = (api: DataSourceApi<IN>, options: Record<string, any>, context: ScriptContext) => Promise<DataSourceApi<OUT>>;

/**
 * type of model script entry
 */
export type ModelEntry<T> = (api: Runtime<T>, options: Record<string, any>, context: ScriptContext) => Promise<void>;

