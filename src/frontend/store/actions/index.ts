export interface IAction<IPayload> {
  readonly type: string;
  readonly payload?: IPayload;
}

export type IActionCreator<InputPayload = undefined, OutputPayload = undefined> = (
  inputPayload?: InputPayload
) => IAction<OutputPayload>;
