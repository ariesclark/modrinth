// Generated at 2021-04-03T04:00:16.303Z.

export interface VersionSource {
    id:             string;
    mod_id:         string;
    author_id:      string;
    featured:       boolean;
    name:           string;
    version_number: string;
    changelog:      string;
    changelog_url:  null | string;
    date_published: string;
    downloads:      number;
    version_type:   string;
    files:          File[];
    dependencies:   any[];
    game_versions:  string[];
    loaders:        string[];
}

export interface File {
    hashes:   Hashes;
    url:      string;
    filename: string;
    primary:  boolean;
}

export interface Hashes {
    sha512?: string;
    sha1:    string;
}
