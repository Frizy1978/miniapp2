export type TelegramApiResponse<T> = {
  description?: string;
  ok: boolean;
  result: T;
};

export type TelegramBotInfo = {
  first_name: string;
  id: number;
  is_bot: boolean;
  username?: string;
};

export type TelegramUpdate = {
  message?: {
    chat: {
      id: number;
      type: string;
    };
    from?: {
      first_name?: string;
      id: number;
      last_name?: string;
      username?: string;
    };
    message_id: number;
    text?: string;
  };
  update_id: number;
};
