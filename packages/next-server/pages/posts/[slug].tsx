import { useRouter } from "next/router";
import ErrorPage from "next/error";
import Container from "../../components/container";
import PostBody from "../../components/post-body";
import Header from "../../components/header";
import PostHeader from "../../components/post-header";
import Layout from "../../components/layout";
import PostTitle from "../../components/post-title";
import Head from "next/head";
import { CMS_NAME } from "../../lib/constants";
import markdownToHtml from "../../lib/markdownToHtml";
import PostType from "../../types/post";
import { GetServerSideProps } from "next";
import * as aws from "aws-sdk";
import Author from "../../types/author";

const Region = process.env.REGION!;
const BlogTableName = process.env.BLOG_TABLE_NAME!;
const dynamodb = new aws.DynamoDB.DocumentClient({
  apiVersion: "2012-08-10",
  region: Region,
  signatureVersion: "v4",
});

type Props = {
  post: PostType;
  morePosts: PostType[];
  preview?: boolean;
};

const Post = ({ post, morePosts, preview }: Props) => {
  console.log("post", post);
  const router = useRouter();
  if (!router.isFallback && !post?.slug) {
    return <ErrorPage statusCode={404} />;
  }
  return (
    <Layout preview={preview}>
      <Container>
        <Header />
        {router.isFallback ? (
          <PostTitle>Loading…</PostTitle>
        ) : (
          <>
            <article className="mb-32">
              <Head>
                <title>
                  {post.title} | Next.js Blog Example with {CMS_NAME}
                </title>
                <meta property="og:image" content={post.ogImage.url} />
              </Head>
              <PostHeader
                title={post.title}
                coverImage={post.coverImage}
                date={post.date}
                author={post.author}
              />
              <PostBody content={post.content} />
            </article>
          </>
        )}
      </Container>
    </Layout>
  );
};

export default Post;

type Params = {
  params: {
    slug: string;
  };
};

type Article = {
  slug: string;
  title: string;
  date: string;
  coverImage: string;
  author: Author;
  excerpt: string;
  ogImage: {
    url: string;
  };
  content: string;
  createAt: string;
};

export const getServerSideProps: GetServerSideProps<Props> = async ({
  params,
}) => {
  console.log("params", params);
  const result = await dynamodb
    .query({
      TableName: BlogTableName,
      IndexName: "slug-createAt-index",
      Limit: 1,
      KeyConditionExpression: "#slug = :slug",
      ExpressionAttributeNames: {
        "#slug": "slug",
      },
      ExpressionAttributeValues: {
        ":slug": (params?.slug as string) ?? "",
      },
    })
    .promise();

  const article: Article = result.Items![0] as Article;
  console.log(article);

  const content = await markdownToHtml(article.content);

  return {
    props: {
      post: {
        ...article,
        content,
      },
      morePosts: [],
    },
  };
};

// export async function getStaticProps({ params }: Params) {
//   const post = getPostBySlug(params.slug, [
//     'title',
//     'date',
//     'slug',
//     'author',
//     'content',
//     'ogImage',
//     'coverImage',
//   ])
//   const content = await markdownToHtml(post.content || '')
//
//   return {
//     props: {
//       post: {
//         ...post,
//         content,
//       },
//     },
//   }
// }
//
// export async function getStaticPaths() {
//   const posts = getAllPosts(['slug'])
//
//   return {
//     paths: posts.map((posts) => {
//       return {
//         params: {
//           slug: posts.slug,
//         },
//       }
//     }),
//     fallback: false,
//   }
// }
