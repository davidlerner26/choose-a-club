import { useEffect, useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import type { User } from 'firebase/auth';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { IconTrash } from '@tabler/icons-react';
import {
  addComment,
  deleteComment,
  getProductComments,
} from '@/firebase/firebase';
import type { Comment } from '@/types';

function initials(name?: string | null) {
  if (!name) return '?';
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

function relativeTime(timestamp: number) {
  const diffMs = Date.now() - timestamp;
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'agora';
  if (minutes < 60) return `há ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `há ${hours}h`;
  const days = Math.floor(hours / 24);
  return `há ${days}d`;
}

type FormValues = {
  text: string;
};

export default function Comments({
  productId,
  profileUserId,
  currentUser,
}: {
  productId: string;
  profileUserId: string;
  currentUser: User | null;
}) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<FormValues>();

  const fetchComments = async () => {
    setIsLoading(true);
    const response = await getProductComments(productId);
    setComments(response);
    setIsLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetching comments when productId changes, per https://react.dev/learn/synchronizing-with-effects#fetching-data
    fetchComments();
  }, [productId]);

  const onSubmit: SubmitHandler<FormValues> = async ({ text }) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    await addComment({ productId, profileUserId, text: trimmed });
    reset();
    await fetchComments();
  };

  const removeComment = async (id: string) => {
    await deleteComment(id);
    await fetchComments();
  };

  const canDelete = (comment: Comment) =>
    currentUser?.uid === comment.authorId ||
    currentUser?.uid === comment.profileUserId;

  const canComment = !!currentUser && currentUser.uid !== profileUserId;

  if (!isLoading && comments.length === 0 && !canComment && currentUser) {
    return null;
  }

  return (
    <div className="w-full space-y-3 border-t px-4 pt-3 pb-4">
      {isLoading ? (
        <div className="flex justify-center py-2">
          <Spinner className="size-4" />
        </div>
      ) : (
        comments.length > 0 && (
          <ul className="space-y-2">
            {comments.map((comment) => (
              <li key={comment.id} className="flex items-start gap-2">
                <Avatar className="size-6">
                  <AvatarImage
                    src={comment.authorPhotoURL ?? undefined}
                    alt={comment.authorName}
                  />
                  <AvatarFallback className="text-[10px]">
                    {initials(comment.authorName)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="text-sm">
                    <span className="font-medium">{comment.authorName}</span>{' '}
                    <span className="text-muted-foreground">
                      {relativeTime(comment.createdAt)}
                    </span>
                  </p>
                  <p className="text-sm break-words">{comment.text}</p>
                </div>
                {canDelete(comment) && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-6 shrink-0"
                    onClick={() => removeComment(comment.id)}
                  >
                    <IconTrash className="size-3.5" stroke={2} />
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )
      )}

      {!currentUser ? (
        <p className="text-xs text-muted-foreground">
          <Link to="/" className="underline">
            Faça login
          </Link>{' '}
          para comentar.
        </p>
      ) : canComment ? (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex items-center gap-2"
        >
          <Input
            placeholder="Escreva um comentário..."
            className="h-8 text-sm"
            {...register('text', { required: true })}
          />
          <Button type="submit" size="sm" disabled={isSubmitting}>
            {isSubmitting ? <Spinner className="size-4" /> : 'Comentar'}
          </Button>
        </form>
      ) : null}
    </div>
  );
}
