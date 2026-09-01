type t_Message = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  followUps?: string[];
  temp?: boolean;
};

type t_ChatInitResponse = {
  chatToken: string;
};

type t_ChatMessagesResponse = {
  messages: t_Message[];
};
