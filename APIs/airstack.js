import 'dotenv/config'
import { init } from "@airstack/node";
import { fetchQuery } from "@airstack/node";

init(process.env['AIRSTACK_API_KEY']);

const query = `{
    FarcasterCasts(
      input: {blockchain: ALL, filter: {castedBy: {_eq: "fc_fname:1dolinski"}}}
    ) {
      Cast {
        castedAtTimestamp
        url
        text
        numberOfReplies
        numberOfRecasts
        numberOfLikes
        fid
        castedBy {
          profileName
        }
        channel {
          name
        }
      }
    }
  }`;

const variables = {"fc_name":"1dolinski"};

const { data, error } = await fetchQuery(query, variables);

const warpcastData = data.FarcasterCasts.Cast.map((cast) => {
    const obj = {
        castedAtTimestamp: cast.castedAtTimestamp,
        text: cast.text,
        numberOfReplies: cast.numberOfReplies,
        numberofLikes: cast.numberOfLikes,
        channel: cast.channel && cast.channel.name || '',
    };
    return JSON.stringify(obj);
    }).join("\n");

export default warpcastData;