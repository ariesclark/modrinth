// Generated at 2021-04-03T04:00:15.119Z.

export interface ModSource {
    id:            string;
    slug:          null | string;
    team:          string;
    title:         string;
    description:   string;
    body:          string;
    body_url:      null | string;
    published:     string;
    updated:       string;
    status:        string;
    license:       License;
    client_side:   string;
    server_side:   string;
    downloads:     number;
    followers:     number;
    categories:    string[];
    versions:      string[];
    icon_url:      null | string;
    issues_url:    null | string;
    source_url:    null | string;
    wiki_url:      null | string;
    discord_url:   null | string;
    donation_urls: any[];
}

export interface License {
    id:   string;
    name: string;
    url:  null | string;
}
