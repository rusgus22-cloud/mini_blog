import { useEffect, useState } from "react";

export default function App() {
  const [posts, setPosts] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState("");

  const [comments, setComments] = useState({});
  const [commentText, setCommentText] = useState("");
  const [commentAuthor, setCommentAuthor] = useState("");
  const [replyTo, setReplyTo] = useState(null);

  const loadPosts = async () => {
    const res = await fetch("/api/posts");
    const data = await res.json();
    setPosts(data);
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const addPost = async () => {
  if (!title || !content || !author) {
    alert("Uzupełnij wszystkie pola artykułu");
    return;
  }

  await fetch("/api/posts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, content, author })
  });

  setTitle("");
  setContent("");
  setAuthor("");
  loadPosts();
};


  const loadComments = async (postId) => {
    const res = await fetch("/api/comments/" + postId);
    const data = await res.json();

    setComments(prev => ({
      ...prev,
      [postId]: data
    }));
  };

  const addComment = async (postId) => {
    if (!commentAuthor || !commentText) return;

    await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        postId,
        author: commentAuthor,
        text: commentText,
        parentId: replyTo
      })
    });

    setCommentText("");
    setCommentAuthor("");
    setReplyTo(null);
    loadComments(postId);
  };

  return (
    <div className="container">
      <h1 className="title">Mini-blog</h1>

      <div className="card">
        <input
          placeholder="Autor"
          value={author}
          onChange={e => setAuthor(e.target.value)}
        />
        <input
          placeholder="Tytuł"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
        <textarea
          placeholder="Treść"
          value={content}
          onChange={e => setContent(e.target.value)}
        />
        <button onClick={addPost}>Dodaj artykuł</button>
      </div>

      {posts.map(p => (
        <div key={p.id} className="post">
          <h2>{p.title}</h2>
          <p>{p.content}</p>
          <p><i>Autor: {p.author}</i></p>

          <button className="secondary" onClick={() => loadComments(p.id)}>
            Komentarze
          </button>

          {comments[p.id]?.filter(c => !c.parentId).map(c => (
            <div key={c.id} className="comment">
              <b>{c.author}</b>: {c.text}
              <button
                className="reply"
                onClick={() => setReplyTo(c.id)}
              >
                Odpowiedz
              </button>

              {comments[p.id]
                .filter(r => r.parentId === c.id)
                .map(r => (
                  <div key={r.id} className="reply-box">
                    <b>{r.author}</b>: {r.text}
                  </div>
                ))}
            </div>
          ))}

          <input
            placeholder="Autor komentarza"
            value={commentAuthor}
            onChange={e => setCommentAuthor(e.target.value)}
          />
          <input
            placeholder="Treść komentarza"
            value={commentText}
            onChange={e => setCommentText(e.target.value)}
          />

          <button onClick={() => addComment(p.id)}>
            {replyTo ? "Dodaj odpowiedź" : "Dodaj komentarz"}
          </button>
        </div>
      ))}
    </div>
  );
}
